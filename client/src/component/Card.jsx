import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';

function Card() {
  const [responseData, setResponseData] = useState([]);
  const searchInputRef = useRef("");
  const BaseURL = "";

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
      fetchData();
    } catch (e) {
      console.log(e);
    }
  };

  const deleteHandler = async (id) => {
    try {
      const response = await axios.delete(`${BaseURL}/api/v1/story/${id}`);
      console.log('response: ', response.data);
      await fetchData();
    } catch (e) {
      console.log(e);
    }
  };

  const searchStories = async (e) => {
    e.preventDefault();
    try {
      const resp = await axios.get(`${BaseURL}/api/v1/search?q=${searchInputRef.current.value}`);
      setResponseData(resp.data);
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
