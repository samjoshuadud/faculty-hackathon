

export default function LoadingScreen() {
    return (
    <>
      <div className=" flex items-center justify-center text-white h-full flex-grow">
        <div className="flex flex-col items-center space-y-4">
          <svg
            className="animate-spin h-10 w-10 text-[#95D5B2]"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8z"
            />
          </svg>
          <p className="text-lg text-[#D8F3DC] font-medium">
            Loading, please wait...
          </p>
        </div>
      </div>
    </>
  );

}
