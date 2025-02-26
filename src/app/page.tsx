/* eslint-disable react/no-unescaped-entities */
import Image from "next/image";
import Link from "next/link";
import React, {useState} from "react";

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleClick = async () => {
    setLoading(true);
    setMessage("");
  
    try {
      const response = await fetch("https://jsonplaceholder.typicode.com/posts/1");
      const data = await response.json();
  
      setTimeout(() => {
        setLoading(false);
        setMessage(`Data Fetched: ${data.title}`);
      }, 2000);
    } catch (error) {
      console.log("API Error:", error)
      setLoading(false);
      setMessage("Failed to fetch data.");
    }
  };

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
        <h1 className="text-3xl font-semibold">Launchpad</h1>    
        <div className="flex items-center space-x-4 mb-4">
        {/* Next.js Logo */}
        <Image src="/next.svg" alt="Next.js Logo" width={140} height={40} />
        <span className="text-2xl font-semibold">+</span>

        {/* Netlify Logo */}
        <Image
          src="https://www.netlify.com/v3/img/components/netlify-light.svg"
          alt="Netlify Logo"
          width={140} 
          height={40}
        />
      </div>
        <p className="text-gray-600 mt-2">Testing CSP, external resources, and UI layout.</p>    

        <div className="mt-2 flex space-x-4">
          <Link href="https://www.netlify.com" className="px-5 py-2 bg-black text-white rounded-lg">
              Deploy Now
          </Link>
        </div>

        <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-6 w-full max-w-4xl">
          {/* External Image */}
          <div className="flex flex-col items-center justify-center p-4 bg-gray-100 rounded-lg shadow">
            <img src="https://miro.medium.com/v2/resize:fit:1100/format:webp/1*1mpE6fsq5LNxH31xeTWi5w.jpeg" alt="External Image" className="rounded-md" />
            <p className="mt-2 text-sm text-gray-500">External Image</p>
          </div>

          {/* Google Font */}
          <div className="flex flex-col items-center justify-center p-4 bg-gray-100 rounded-lg shadow">
            <p className="text-xl font-serif italic">"Custom Font Example"</p>
            <p className="mt-2 text-sm text-gray-500">Google Font Loaded</p>
          </div>

          {/* Button */}
        <div className="flex flex-col items-center justify-center p-4 bg-gray-100 rounded-lg shadow">
          <button
            onClick={handleClick}
            className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-300"
          >
            {loading ? "Processing..." : "Fetch Data"}
          </button>
          
          {/* Loader / Message */}
          {loading && (
            <div className="mt-3 flex items-center space-x-2 text-blue-600">
              <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent animate-spin rounded-full"></div>
              <span>Loading...</span>
            </div>
          )}
          
          {message && (
            <p className="mt-3 text-green-600 font-medium">{message}</p>
          )}

          <p className="mt-2 text-sm text-gray-500">Runs an API request</p>
        </div>
          </div>
      </main>
    </div>
  );
}
