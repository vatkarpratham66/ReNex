import React from "react";
import { useAuth } from "../../context/AuthContext";
import { Link } from "react-router-dom";

const Dashboard = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-8">
      {/* Welcome + Impact */}
      <div className="bg-white p-6 rounded-xl shadow">
        <h1 className="text-xl font-bold text-gray-800">
          Welcome back, {user?.name || "Friend"}! 👋
        </h1>
        <p className="text-gray-500">Ready to make a difference today?</p>

        <div className="mt-4">
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>Your Impact</span>
            <span>Lives Helped: 28</span>
          </div>
          <div className="w-full bg-gray-200 h-3 rounded-full">
            <div className="bg-green-500 h-3 rounded-full" style={{ width: "75%" }}></div>
          </div>
          <p className="text-sm text-gray-500 mt-1">Progress to next level: 3 Donations</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link to="/donor/create" className="bg-green-500 text-white py-4 rounded-xl shadow hover:bg-green-600 text-center font-semibold">
          ➕ Create Donation
        </Link>
        <Link to="/messages" className="bg-orange-500 text-white py-4 rounded-xl shadow hover:bg-orange-600 text-center font-semibold">
          💬 Messages
        </Link>
        <Link to="/ngo/browse" className="bg-sky-500 text-white py-4 rounded-xl shadow hover:bg-sky-600 text-center font-semibold">
          🔍 Find NGOs
        </Link>
        <Link to="/achievements" className="bg-purple-500 text-white py-4 rounded-xl shadow hover:bg-purple-600 text-center font-semibold">
          🏆 Achievements
        </Link>
      </div>

      {/* Recent Donations */}
      <div className="bg-white p-6 rounded-xl shadow">
        <h2 className="text-lg font-bold mb-4">Recent Donations</h2>
        <div className="space-y-3">
          <div className="p-4 border rounded-lg flex justify-between items-center">
            <div>
              <p className="font-semibold text-gray-700">Fresh Vegetables & Fruits</p>
              <p className="text-sm text-gray-500">Food · 5 kg</p>
            </div>
            <span className="bg-green-100 text-green-600 px-3 py-1 text-xs rounded-full">completed</span>
          </div>
          <div className="p-4 border rounded-lg flex justify-between items-center">
            <div>
              <p className="font-semibold text-gray-700">Educational Books</p>
              <p className="text-sm text-gray-500">Books · 20 pcs</p>
            </div>
            <span className="bg-blue-100 text-blue-600 px-3 py-1 text-xs rounded-full">requested</span>
          </div>
          <div className="p-4 border rounded-lg flex justify-between items-center">
            <div>
              <p className="font-semibold text-gray-700">Winter Clothes</p>
              <p className="text-sm text-gray-500">Clothes · 15 items</p>
            </div>
            <span className="bg-yellow-100 text-yellow-600 px-3 py-1 text-xs rounded-full">available</span>
          </div>
        </div>
      </div>

      {/* Urgent Requests */}
      <div className="bg-white p-6 rounded-xl shadow">
        <h2 className="text-lg font-bold mb-4">Urgent Requests Nearby</h2>
        <div className="space-y-3">
          <div className="p-4 rounded-lg bg-red-50 border border-red-200 flex justify-between items-center">
            <div>
              <p className="font-semibold text-red-600">Emergency Food Drive</p>
              <p className="text-sm text-gray-600">Food Needed</p>
            </div>
            <button className="bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600">Help Now</button>
          </div>
          <div className="p-4 rounded-lg bg-yellow-50 border border-yellow-200 flex justify-between items-center">
            <div>
              <p className="font-semibold text-yellow-600">School Supply Drive</p>
              <p className="text-sm text-gray-600">Education Kits Needed</p>
            </div>
            <button className="bg-yellow-500 text-white px-3 py-1 rounded-lg hover:bg-yellow-600">Donate</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
