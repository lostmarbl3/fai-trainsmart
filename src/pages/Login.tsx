import { useNavigate } from "react-router-dom";

const Login = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-6 bg-white dark:bg-black text-black dark:text-white">
      <h1 className="text-3xl font-bold mb-6">Select Your Role</h1>
      <button
        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded w-48"
        onClick={() => navigate("/trainer")}
      >
        Trainer
      </button>
      <button
        className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded w-48"
        onClick={() => navigate("/client")}
      >
        Client
      </button>
      <button
        className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded w-48"
        onClick={() => navigate("/solo")}
      >
        Solo
      </button>
    </div>
  );
};

export default Login;
