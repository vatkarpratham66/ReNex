import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../api/axios";
import { Loader2 } from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from "recharts";

import Navbar from "../components/Navbar";

const Landing = () => {
  const [stats, setStats] = useState({
    totals: { donations: 0, ngos: 0, lives: 0, cities: 0 },
    trends: [],
  });
  const [loading, setLoading] = useState(true);

  // 📊 Fetch global stats
  useEffect(() => {
    const loadStats = async () => {
      try {
        const { data } = await API.get("/stats");

        const totals = data.totals ?? {
          donations: data.donations ?? 0,
          ngos: data.ngos ?? 0,
          lives: data.lives ?? 0,
          cities: data.cities ?? 0,
        };

        const donationsTrend = data.trends?.donations ?? [];
        const livesTrend = data.trends?.lives ?? [];

        const merged = {};
        donationsTrend.forEach((d) => {
          if (!d?._id) return;
          const key = `${d._id.year}-W${d._id.week}`;
          merged[key] = { week: key, donations: d.count ?? 0, lives: 0 };
        });
        livesTrend.forEach((l) => {
          if (!l?._id) return;
          const key = `${l._id.year}-W${l._id.week}`;
          if (!merged[key]) merged[key] = { week: key, donations: 0, lives: l.count ?? 0 };
          else merged[key].lives = l.count ?? 0;
        });

        setStats({
          totals,
          trends: Object.values(merged).sort((a, b) => a.week.localeCompare(b.week)),
        });
      } catch (err) {
        console.error("Stats load error:", err);
      } finally {
        setLoading(false);
      }
    };
    loadStats();
  }, []);

  return (
    <div className="bg-gray-50">
      <Navbar />
      {/* HERO */}
      <header className="bg-gradient-to-r from-sky-600 to-green-600 text-white">
        <div className="max-w-7xl mx-auto px-6 py-20 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-4xl md:text-6xl font-extrabold leading-tight">
              Share Surplus, <br /> <span className="text-yellow-300">Change Lives</span>
            </h1>
            <p className="mt-6 text-lg text-gray-100 max-w-md">
              Turn your surplus food, clothes, or books into hope for communities in need.
            </p>
            <div className="mt-8 flex gap-4">
              <Link
                to="/donor/create"
                className="bg-white text-sky-600 px-6 py-3 rounded-xl font-semibold shadow hover:bg-gray-100 transition"
              >
                Start Donating
              </Link>
              <Link
                to="/ngo/browse"
                className="bg-green-500 text-white px-6 py-3 rounded-xl font-semibold shadow hover:bg-green-600 transition"
              >
                Join as NGO
              </Link>
            </div>
          </div>
          <div className="rounded-2xl overflow-hidden shadow-xl">
            <img
              src="https://source.unsplash.com/random/800x600/?volunteer,help"
              alt="Hero"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </header>

      {/* HOW IT WORKS */}
      <section className="max-w-7xl mx-auto px-6 py-20 text-center">
        <h2 className="text-3xl font-bold mb-12">How It Works</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              title: "Create Donation",
              desc: "Post your surplus items in just a few clicks.",
              img: "https://source.unsplash.com/random/400x300/?donation,food",
            },
            {
              title: "NGO Matches",
              desc: "Verified NGOs accept donations that meet their needs.",
              img: "https://source.unsplash.com/random/400x300/?ngo,community",
            },
            {
              title: "Make Impact",
              desc: "Coordinate pickups or drop-offs and see the difference.",
              img: "https://source.unsplash.com/random/400x300/?charity,impact",
            },
          ].map((step, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition"
            >
              <img src={step.img} alt={step.title} className="h-40 w-full object-cover" />
              <div className="p-6">
                <h3 className="text-lg font-bold mb-2">{step.title}</h3>
                <p className="text-gray-600">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* IMPACT */}
      <section className="bg-gradient-to-r from-gray-100 to-gray-200 py-20">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-10">Our Global Impact</h2>
          {loading ? (
            <Loader2 className="animate-spin mx-auto text-gray-500" />
          ) : (
            <>
              <div className="grid md:grid-cols-4 gap-10 mb-12">
                <div>
                  <p className="text-4xl font-bold text-sky-600">{stats.totals.donations}</p>
                  <p className="text-gray-700">Total Donations</p>
                </div>
                <div>
                  <p className="text-4xl font-bold text-green-600">{stats.totals.ngos}</p>
                  <p className="text-gray-700">Active NGOs</p>
                </div>
                <div>
                  <p className="text-4xl font-bold text-orange-600">{stats.totals.lives}</p>
                  <p className="text-gray-700">Lives Impacted</p>
                </div>
                <div>
                  <p className="text-4xl font-bold text-purple-600">{stats.totals.cities}</p>
                  <p className="text-gray-700">Cities Reached</p>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow p-6">
                <h3 className="text-lg font-semibold mb-4">Trends (Last 6 Weeks)</h3>
                {Array.isArray(stats.trends) && stats.trends.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={stats.trends}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="week" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="donations" stroke="#0ea5e9" strokeWidth={2} name="Donations" />
                      <Line type="monotone" dataKey="lives" stroke="#f97316" strokeWidth={2} name="Lives Impacted" />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-gray-500">No trend data available</p>
                )}
              </div>
            </>
          )}
        </div>
      </section>

      {/* SUCCESS STORIES */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <h2 className="text-3xl font-bold text-center mb-12">Success Stories</h2>
        <div className="grid md:grid-cols-2 gap-8">
          {[
            {
              title: "500+ Meals Shared",
              desc: "Donors helped feed families in urban areas.",
              img: "https://source.unsplash.com/random/600x400/?meals,help",
            },
            {
              title: "1200+ Books Donated",
              desc: "NGOs distributed books to underprivileged children.",
              img: "https://source.unsplash.com/random/600x400/?books,education",
            },
          ].map((story, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl shadow overflow-hidden hover:shadow-lg transition"
            >
              <img src={story.img} alt={story.title} className="h-48 w-full object-cover" />
              <div className="p-6">
                <h3 className="font-bold">{story.title}</h3>
                <p className="text-gray-600 text-sm">{story.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-gray-900 text-gray-400 py-10 mt-16">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-white font-bold text-lg mb-2">SurplusConnect</h3>
            <p>Connecting donors with NGOs to reduce waste and make impact.</p>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-2">Platform</h4>
            <ul className="space-y-1">
              <li><Link to="/about" className="hover:text-white">How it Works</Link></li>
              <li><Link to="/donors" className="hover:text-white">For Donors</Link></li>
              <li><Link to="/ngos" className="hover:text-white">For NGOs</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-2">Support</h4>
            <ul className="space-y-1">
              <li><Link to="/help" className="hover:text-white">Help Center</Link></li>
              <li><Link to="/contact" className="hover:text-white">Contact Us</Link></li>
            </ul>
          </div>
        </div>
        <p className="text-center text-gray-500 mt-8">
          © {new Date().getFullYear()} SurplusConnect. All rights reserved.
        </p>
      </footer>
    </div>
  );
};

export default Landing;
