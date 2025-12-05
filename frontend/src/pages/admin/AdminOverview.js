// frontend/src/pages/admin/AdminOverview.js
import React, { useMemo } from "react";
import { useOutletContext } from "react-router-dom";
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell,
} from "recharts";

// Đây chính là component DashboardContent cũ của bạn
function AdminOverview() {
  const { users, songs, artists, dailyListens, artistListens } = useOutletContext();

  const topSongs = useMemo(() => {
    return [...songs]
      .sort((a, b) => (b.listen_count || 0) - (a.listen_count || 0))
      .slice(0, 5);
  }, [songs]);

  const chartData = useMemo(() => {
    return topSongs.map((song) => ({
      name: song.title.length > 20 ? song.title.substring(0, 20) + "..." : song.title,
      listens: song.listen_count || 0,
    }));
  }, [topSongs]);
  
  const artistChartData = useMemo(() => {
    return (artistListens || []).map(artist => ({
      name: artist.name,
      listens: artist.listens || 0,
    }));
  }, [artistListens]);

  const colors = ["#8b5cf6", "#3b82f6", "#10b981", "#f59e0b", "#ef4444"];

  return (
    <div>
      {/* ... (Toàn bộ JSX của DashboardContent cũ dán vào đây) ... */}
       <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-gray-600">Tổng quan</p>
      </header>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {/* ... (3 thẻ thống kê) ... */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            Tổng Người Dùng
          </h3>
          <p className="text-3xl font-bold text-blue-600">{users.length}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            Tổng Bài Hát
          </h3>
          <p className="text-3xl font-bold text-green-600">{songs.length}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            Tổng Nghệ Sĩ
          </h3>
          <p className="text-3xl font-bold text-purple-600">{artists.length}</p>
        </div>
      </div>
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* ... (Biểu đồ LineChart) ... */}
          <div className="bg-white p-6 rounded-lg shadow-md">
                      <h3 className="text-lg font-semibold text-gray-700 mb-4">
                        Biểu đồ lượt nghe hàng ngày (7 ngày qua)
                      </h3>
                      {dailyListens.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                          <LineChart data={dailyListens}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis />
                            <Tooltip
                              formatter={(value) => `${value.toLocaleString()} lượt`}
                              contentStyle={{
                                backgroundColor: "#353f4cff",
                                border: "none",
                                borderRadius: "8px",
                              }}
                              labelStyle={{ color: "#f3f4f6" }}
                            />
                            <Line
                              type="monotone"
                              dataKey="count"
                              stroke="#a07ef0ff"
                              strokeWidth={2}
                              dot={{ fill: "#a07ef0ff", r: 4 }}
                              activeDot={{ r: 6 }}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="h-64 rounded flex items-center justify-center text-gray-500">
                          Đang tải dữ liệu...
                        </div>
                      )}
                    </div>
          {/* ... (Biểu đồ BarChart Top Songs) ... */}
          <div className="bg-white p-6 rounded-lg shadow-md">
                      <h3 className="text-lg font-semibold text-gray-700 mb-4">
                        Top 5 Bài hát được nghe nhiều nhất
                      </h3>
                      {topSongs.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                          <BarChart
                            data={chartData}
                            margin={{
                              top: 20,
                              right: 30,
                              left: 20,
                              bottom: 60,
                            }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis
                              dataKey="name"
                              angle={-45}
                              textAnchor="end"
                              height={100}
                            />
                            <YAxis />
                            <Tooltip
                              formatter={(value) => `${value.toLocaleString()} lượt`}
                              contentStyle={{
                                backgroundColor: "#6d86a7ff",
                                border: "none",
                                borderRadius: "8px",
                              }}
                              labelStyle={{ color: "#f3f4f6" }}
                            />
                            <Bar dataKey="listens" name="Lượt nghe">
                              {chartData.map((entry, index) => (
                                <Cell
                                  key={`cell-${index}`}
                                  fill={colors[index % colors.length]}
                                />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="h-64 rounded flex items-center justify-center text-gray-500">
                          Chưa có dữ liệu lượt nghe.
                        </div>
                      )}
                    </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">
            Top nghệ sĩ được nghe nhiều nhất
          </h3>
          {/* ... (Biểu đồ BarChart Top Artists) ... */}
          {artistListens.length > 0 ? (
                      <ResponsiveContainer width="100%" height={350}>
                        <BarChart
                          data={artistListens}
                          margin={{
                            top: 20,
                            right: 30,
                            left: 20,
                            bottom: 80,
                          }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis
                            dataKey="name"
                            angle={-45}
                            textAnchor="end"
                            height={100}
                            interval={0} // Đảm bảo tất cả nhãn đều được hiển thị
                          />
                          <YAxis />
                          <Tooltip
                            formatter={(value) => `${value.toLocaleString()} lượt`}
                            contentStyle={{
                              backgroundColor: "#1f2937",
                              border: "none",
                              borderRadius: "8px",
                            }}
                            labelStyle={{ color: "#f3f4f6" }}
                          />
                          <Bar dataKey="listens" name="Lượt nghe" fill="#3b82f6" />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-64 rounded flex items-center justify-center text-gray-500">
                        Đang tải dữ liệu nghệ sĩ...
                      </div>
                    )}
        </div>
      </div>
    </div>
  );
}

export default AdminOverview;