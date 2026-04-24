import CommonWrapper from "@/common/CommonWrapper";

const UserDashboard = () => {
  return (
    <CommonWrapper>
      <div className="p-6">
        <h1 className="text-3xl font-semibold text-gray-900 mb-4">
          User Dashboard
        </h1>
        <p className="text-gray-600">
          Welcome to your personal dashboard. Here you can manage your profile,
          view your activity, and access your personal settings.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="p-6 rounded-xl border border-gray-100 bg-white shadow-sm"
            >
              <h3 className="font-semibold text-lg mb-2">Stat {i}</h3>
              <p className="text-2xl font-bold text-blue-600">1,234</p>
            </div>
          ))}
        </div>
      </div>
    </CommonWrapper>
  );
};

export default UserDashboard;
