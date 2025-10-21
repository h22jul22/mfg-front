export const RetryBtn = () => {
  return (
<div className="flex justify-center items-center h-screen">
        <button
        onClick={() => {
          window.location.href = '/login';
        }}
        className="px-4 py-2 bg-blue-700 text-white rounded hover:bg-blue-600"
      >
        로그인 다시 시도
      </button>
</div>
  );
};