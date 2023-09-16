import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';

function Card() {
  const [responseData, setResponseData] = useState([]);
  const searchInputRef = useRef("");
  const BaseURL = "http://localhost:8080";
  const [loader  , setloader] = useState(false)

  async function fetchData() {
    try {
      const response = await axios.get(`${BaseURL}/api/v1/allpost`);
      console.log(response.data);
      setResponseData(response.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  const updateStory = async (e, id) => {
    e.preventDefault();
    try {
      const response = await axios.put(`${BaseURL}/api/v1/story/${id}`, {
        title: e.target.titleInput.value,
        body: e.target.bodyInput.value,
      });
      console.log('response: ', response.data);
     
    } catch (e) {
      console.log(e);
    }
  };

  const deleteHandler = async (id) => {
    try {
      const response = await axios.delete(`${BaseURL}/api/v1/story/${id}`);
      console.log('response: ', response.data);
    } catch (e) {
      console.log(e);
    }
  };

  const searchStories = async (e) => {
    e.preventDefault();
    try {
      setloader(true)
      const resp = await axios.get(`${BaseURL}/api/v1/search?q=${searchInputRef.current.value}`);
      setResponseData(resp.data);
      setloader(false)
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <>
      <form onSubmit={searchStories} className="text-right my-14">
        <div className="relative">
          <input
            ref={searchInputRef}
            id="searchInput"
            type="search"
            placeholder="Search"
            className="border rounded-full py-2 px-4 focus:outline-none focus:ring focus:border-blue-300 w-64"
          />
          <button type="submit" hidden>Search</button>
        </div>
      </form>
      
      {(loader === true) ? 
     <div class="text-center">
     <div role="status">
         <svg aria-hidden="true" class="inline w-8 h-8 mr-2 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
             <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
             <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
         </svg>
         <span class="sr-only">Loading...</span>
     </div>
 </div>
 : null}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {responseData.map((eachStory, index) => (
          <div key={index} className="bg-white rounded-lg p-4 mx-4 my-4 shadow-lg border border-gray-300 flex flex-col justify-between">
            <div>
              <h3 className="text-lg font-semibold">{eachStory.metadata.title}</h3>
              <p className="mt-2 text-gray-700">{eachStory.metadata.body}</p>
            </div>

            <div className="mt-4">
              {eachStory.isEdit ? (
                <form onSubmit={(e) => updateStory(e, eachStory.id)}>
                  <label htmlFor="titleInput" className="text-lg font-semibold">
                    Title:
                  </label>
                  <br />
                  <input
                    defaultValue={eachStory.metadata.title}
                    name="titleInput"
                    type="text"
                    id="titleInput"
                    required
                    className="w-full px-2 py-1 rounded-md border border-gray-300 focus:outline-none focus:border-blue-500"
                  />
                  <br />
                  <label htmlFor="bodyInput" className="text-lg font-semibold">
                    What's on your mind:
                  </label>
                  <br />
                  <textarea
                    defaultValue={eachStory.metadata.body}
                    name="bodyInput"
                    type="text"
                    id="bodyInput"
                    required
                    className="w-full px-2 py-1 rounded-md border border-gray-300 focus:outline-none focus:border-blue-500"
                  ></textarea>
                  <br />
                  <button
                    type="submit"
                    className="bg-blue-500 text-white px-3 py-2 rounded-md hover:bg-blue-700 mr-2"
                  >
                    Update
                  </button>
                  <button
                    onClick={() => {
                      eachStory.isEdit = false;
                      setResponseData([...responseData]);
                    }}
                    className="bg-gray-500 text-white px-3 py-2 rounded-md hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                </form>
              ) : (
                <div>
                  <button
                    onClick={() => {
                      deleteHandler(eachStory.id);
                    }}
                    className="bg-red-500 text-white px-3 py-2 rounded-md hover:bg-red-700 mr-2"
                  >
                    Delete
                  </button>
                  <button
                    onClick={() => {
                      responseData[index].isEdit = true;
                      setResponseData([...responseData]);
                    }}
                    className="bg-blue-500 text-white px-3 py-2 rounded-md hover:bg-blue-700"
                  >
                    Edit
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

export default Card;
