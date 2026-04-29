import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../api/axios";
import { Loader2 } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";

const Landing = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  

  const [stats, setStats] = useState({
    totals: { donations: 0, ngos: 0, lives: 0, locations: 0 },
    trends: [],
  });
  const [loading, setLoading] = useState(true);

  // Redirect based on user role
  useEffect(() => {
    if (user?.role === "admin") navigate("/admin/dashboard");
    else if (user?.role === "donor" || user?.role === "ngo") navigate("/dashboard");
  }, [user, navigate]);

  // Fetch stats
  useEffect(() => {
    const loadStats = async () => {
      try {
        const { data } = await API.get("/stats");

        const totals = data.totals ?? {
          donations: data.donations ?? 0,
          ngos: data.ngos ?? 0,
          lives: data.lives ?? 0,
          locations: data.locations ?? 0,
        };

        totals.locations = totals.locations ?? data.locations ?? data.cities ?? 0;

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
          if (!merged[key])
            merged[key] = { week: key, donations: 0, lives: l.count ?? 0 };
          else merged[key].lives = l.count ?? 0;
        });

        setStats({
          totals,
          trends: Object.values(merged).sort((a, b) =>
            a.week.localeCompare(b.week)
          ),
        });
      } catch (err) {
        if (process.env.NODE_ENV === "development")
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
        <div className="max-w-7xl mx-auto px-5 sm:px-8 py-14 sm:py-20 flex flex-col-reverse md:flex-row items-center gap-10">
          {/* Text Content */}
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-3xl sm:text-5xl font-extrabold leading-tight">
              Share Surplus, <br />
              <span className="text-yellow-300">Change Lives</span>
            </h1>
            <p className="mt-4 text-sm sm:text-lg text-gray-100 max-w-md mx-auto md:mx-0">
              Turn your surplus food, clothes, or books into hope for communities in need.
            </p>
            <div className="mt-6 flex flex-col sm:flex-row justify-center md:justify-start gap-4">
              <Link
                to="/donor/create"
                className="bg-white text-sky-700 px-6 py-3 rounded-xl font-semibold shadow hover:bg-gray-100 transition text-sm sm:text-base"
              >
                Start Donating
              </Link>
              <Link
                to="/register?role=ngo"
                className="bg-green-500 text-white px-6 py-3 rounded-xl font-semibold shadow hover:bg-green-600 transition text-sm sm:text-base"
              >
                Join as NGO
              </Link>
            </div>
            <p className="mt-3 text-xs sm:text-sm text-gray-200">
              ✓ Verified NGOs • Secure Donations • Real Impact
            </p>
          </div>

          {/* Image */}
          <div className="flex-1">
            <img
              src="https://images.unsplash.com/photo-1509099836639-18ba1795216d"
              alt="Volunteers distributing food"
              className="rounded-2xl shadow-lg w-full object-cover h-60 sm:h-80"
              loading="lazy"
              decoding="async"
            />
          </div>
        </div>
      </header>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="max-w-7xl mx-auto px-5 sm:px-8 py-14 sm:py-20 text-center">
        <h2 className="text-2xl sm:text-3xl font-bold mb-10 sm:mb-12">How It Works</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8">
          {[
            {
              title: "Create Donation",
              desc: "Post your surplus items easily from your phone.",
              img: "https://images.unsplash.com/photo-1606787366850-de6330128bfc",
            },
            {
              title: "NGO Matches",
              desc: "Verified NGOs accept donations that meet their needs.",
              img: "https://images.unsplash.com/photo-1601968177507-a5e8f1f57c0e",
            },
            {
              title: "Make Impact",
              desc: "Coordinate pickups or drop-offs and change lives.",
              img: "https://images.unsplash.com/photo-1549576490-b0b4831ef60a",
            },
          ].map((step, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition"
            >
              <img
                src={step.img}
                alt={step.title}
                className="h-44 sm:h-52 w-full object-cover"
                loading="lazy"
              />
              <div className="p-5 sm:p-6">
                <h3 className="text-lg font-bold mb-2">{step.title}</h3>
                <p className="text-gray-600 text-sm sm:text-base">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* IMPACT STATS */}
      <section className="bg-gray-100 py-14 sm:py-20 text-center">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <h2 className="text-2xl sm:text-3xl font-bold mb-8 sm:mb-10">Our Global Impact</h2>

          {loading ? (
            <Loader2 className="animate-spin mx-auto text-gray-500" />
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mb-10">
                {[
                  {
                    label: "Donations",
                    value: stats.totals.donations.toLocaleString(),
                    color: "text-sky-600",
                  },
                  {
                    label: "NGOs",
                    value: stats.totals.ngos.toLocaleString(),
                    color: "text-green-600",
                  },
                  {
                    label: "Lives",
                    value: stats.totals.lives.toLocaleString(),
                    color: "text-orange-600",
                  },
                  {
                    label: "Locations",
                    value: stats.totals.locations.toLocaleString(),
                    color: "text-purple-600",
                  },
                ].map((item, i) => (
                  <div key={i}>
                    <p className={`text-3xl sm:text-4xl font-bold ${item.color}`}>
                      {item.value}
                    </p>
                    <p className="text-gray-700 text-sm sm:text-base">{item.label}</p>
                  </div>
                ))}
              </div>

              <div className="bg-white rounded-2xl shadow p-4 sm:p-6">
                <h3 className="text-lg font-semibold mb-3 sm:mb-4">
                  Weekly Trends
                </h3>
                {stats.trends.length > 0 ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={stats.trends}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="week" tickFormatter={(w) => w.split("-W")[1]} />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="donations" stroke="#0ea5e9" name="Donations" />
                      <Line type="monotone" dataKey="lives" stroke="#f97316" name="Lives Impacted" />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-gray-500 text-sm sm:text-base">
                    No data available
                  </p>
                )}
              </div>
            </>
          )}
        </div>
      </section>

      {/* SUCCESS STORIES */}
      <section id="success-stories" className="max-w-7xl mx-auto px-5 sm:px-8 py-14 sm:py-20">
        <h2 className="text-2xl sm:text-3xl font-bold text-center mb-10 sm:mb-12">
          Success Stories
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
          {[
            {
              title: "500+ Meals Shared",
              desc: "Donors helped feed families in urban areas.",
              img: "https://images.unsplash.com/photo-1508873696983-2dfd5898f08b",
            },
            {
              title: "1200+ Books Donated",
              desc: "NGOs distributed books to underprivileged children.",
              img: "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f",
            },
          ].map((story, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl shadow overflow-hidden hover:shadow-lg transition"
            >
              <img
                src={story.img}
                alt={story.title}
                className="h-48 w-full object-cover"
                loading="lazy"
              />
              <div className="p-5 sm:p-6">
                <h3 className="font-bold text-base sm:text-lg mb-1">
                  {story.title}
                </h3>
                <p className="text-gray-600 text-sm sm:text-base">{story.desc}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="text-center mt-8">
          <a href="#how-it-works" className="text-sky-600 font-semibold hover:underline">
            See How It Works →
          </a>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-gray-900 text-gray-400 py-10 sm:py-12 text-center sm:text-left">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 grid grid-cols-1 sm:grid-cols-3 gap-8">
          <div>
            <h3 className="text-white font-bold text-lg mb-2">SurplusConnect</h3>
            <p className="text-sm">
              Connecting donors with NGOs to reduce waste and create real change.
            </p>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-2">Platform</h4>
            <ul className="space-y-1 text-sm">
              <li><a href="#how-it-works" className="hover:text-white">How it Works</a></li>
              <li><Link to="/register?role=donor" className="hover:text-white">For Donors</Link></li>
              <li><Link to="/register?role=ngo" className="hover:text-white">For NGOs</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-2">Support</h4>
            <ul className="space-y-1 text-sm">
              <li><Link to="/login" className="hover:text-white">Help Center</Link></li>
              <li><a href="mailto:support@needo.local" className="hover:text-white">Contact</a></li>
              <li><a href="#success-stories" className="hover:text-white">Success Stories</a></li>
              <li><Link to="/register?role=ngo" className="hover:text-white">Partner with Us</Link></li>
            </ul>
          </div>
        </div>
        <p className="text-gray-500 text-xs sm:text-sm mt-6 sm:mt-8">
          © {new Date().getFullYear()} SurplusConnect. All rights reserved.
        </p>
      </footer>
    </div>
  );
};

export default Landing;
