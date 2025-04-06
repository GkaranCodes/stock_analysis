import axios from "axios";
import React, { useState, useEffect } from "react";
import { formatDateForInput } from "../utils/helpers";
const BASE_URL = import.meta.env.VITE_BASE_URL;

const Home = () => {
  const [formData, setFormData] = useState({
    stockName: "",
    dateFrom: "",
    dateTo: "",
    result: "",
  });

  const [newAnalysis, setNewAnalysis] = useState({
    date: "",
    name: "",
    directionPlanned: "",
    actualMove: "",
    analysisResult: "",
    remarks: "",
  });

  const [allAnalyses, setAllAnalyses] = useState([]);

  const [analyses, setAnalyses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [editingId, setEditingId] = useState(null);
  const [editing, setEditing] = useState(false);

  const [editingDetails, setEditingDetails] = useState({
    date: "",
    name: "",
    directionPlanned: "",
    actualMove: "",
    analysisResult: "",
    remarks: "",
  });

  useEffect(() => {
    const record = allAnalyses.find((i) => i._id === editingId);
    if (record) {
      setEditingDetails({
        date: formatDateForInput(record.date) || "",
        name: record.name || "",
        directionPlanned: record.directionPlanned || "",
        actualMove: record.actualMove || "",
        analysisResult: record.analysisResult || "",
        remarks: record.remarks || "",
      });
    }
  }, [editingId, allAnalyses]);

  useEffect(() => {
    fetchAnalyses();
  }, []);

  const fetchAnalyses = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${BASE_URL}/get-analysis`);
      const fetchedData = res.data.data || [];
      setAllAnalyses(fetchedData);
      setAnalyses(fetchedData);
      setError(null);
    } catch (err) {
      console.error("Error fetching analyses:", err);
      setError("Failed to load analysis data");
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleEditChange = (e) => {
    setEditingDetails({
      ...editingDetails,
      [e.target.name]: e.target.value,
    });
  };

  const handleEditAnalysis = async (id) => {
    setEditing(true);
    try {
      const response = await axios.put(
        `${BASE_URL}/edit-analysis?id=${id}`,
        editingDetails
      );
      if (response.status == 200) {
        console.log("Data Updated Successfully");
      }
      await fetchAnalyses();
      setEditingId(null);
    } catch (error) {
      console.log("Failed to update data");
    } finally {
      setEditing(false);
    }
  };

  const handleDeleteAnalysis = async (id) => {
    try {
      const res = await axios.delete(`${BASE_URL}/delete-analysis?id=${id}`);
      if (res.ok) {
        console.log("Data deleted successfully");
      }
      await fetchAnalyses();
    } catch (error) {
      console.log("Failed to delete data", error?.message);
    }
  };

  const handleAddChange = (e) => {
    setNewAnalysis({
      ...newAnalysis,
      [e.target.name]: e.target.value,
    });
  };

  const handleClearFilter = async (e) => {
    e.preventDefault();
    try {
      setFormData({
        stockName: "",
        dateFrom: "",
        dateTo: "",
        direction: "",
        result: "",
      });
      await fetchAnalyses();
    } catch (error) {
      console.log("Something went wrong");
    }
  };

  const handleFilter = (e) => {
    e.preventDefault();

    const filtered = allAnalyses.filter((item) => {
      const { stockName, dateFrom, dateTo, direction, result } = formData;

      const matchesStock = stockName
        ? item.name.toLowerCase().includes(stockName.toLowerCase())
        : true;
      const matchesResult = result ? item.analysisResult === result : true;

      const itemDate = new Date(item.date);
      const fromDate = dateFrom ? new Date(dateFrom) : null;
      const toDate = dateTo ? new Date(dateTo) : null;

      const matchesDate =
        (!fromDate || itemDate >= fromDate) && (!toDate || itemDate <= toDate);

      return matchesStock && matchesDirection && matchesResult && matchesDate;
    });

    setAnalyses(filtered);
  };

  const submitForm = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await axios.post(`${BASE_URL}/create-analysis`, newAnalysis);

      if (res.status === 200 || res.status === 201) {
        setNewAnalysis({
          date: "",
          name: "",
          directionPlanned: "",
          actualMove: "",
          analysisResult: "",
          remarks: "",
        });

        await fetchAnalyses();
      }
    } catch (err) {
      console.error("Error adding analysis:", err);
      setError("Failed to add analysis");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-500 to-gray-100 w-full">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-white mb-2">Stock Analysis</h1>
          <p className="text-white opacity-80">
            Track and analyze your stock predictions
          </p>
        </header>
        <div className="bg-white my-10 p-5 rounded-xl shadow-lg">
          <h2 className="text-xl font-semibold text-white pl-5 bg-gradient-to-r bg-sky-400 to-white rounded-xl">
            Add New Analysis
          </h2>
          <form className="flex flex-wrap justify-between items-end gap-4 mt-2">
            <div className="flex flex-col justify-start">
              <label
                className="font-semibold text-gray-500 mb-1"
                htmlFor="date"
              >
                Date
              </label>
              <input
                type="date"
                name="date"
                value={newAnalysis.date}
                onChange={handleAddChange}
                className="border border-gray-300 p-2 rounded-lg outline-none focus:ring-2 focus:ring-indigo-200"
              />
            </div>
            <div className="flex flex-col justify-start">
              <label
                className="font-semibold text-gray-500 mb-1"
                htmlFor="name"
              >
                Stock
              </label>
              <input
                type="text"
                name="name"
                value={newAnalysis.name}
                onChange={handleAddChange}
                className="border border-gray-300 p-2 rounded-lg outline-none focus:ring-2 focus:ring-indigo-200"
                placeholder="Enter stock name"
              />
            </div>
            <div className="flex flex-col justify-start">
              <label
                className="font-semibold text-gray-500 mb-1"
                htmlFor="directionPlanned"
              >
                Direction Planned
              </label>
              <input
                type="text"
                name="directionPlanned"
                onChange={handleAddChange}
                value={newAnalysis.directionPlanned}
                className="border border-gray-300 p-2 rounded-lg outline-none focus:ring-2 focus:ring-indigo-200"
                placeholder="Enter planned direction"
              />
            </div>
            <div className="flex flex-col justify-start">
              <label
                className="font-semibold text-gray-500 mb-1"
                htmlFor="actualMove"
              >
                Actual Move
              </label>
              <input
                type="text"
                name="actualMove"
                value={newAnalysis.actualMove}
                onChange={handleAddChange}
                className="border border-gray-300 p-2 rounded-lg outline-none focus:ring-2 focus:ring-indigo-200"
                placeholder="Enter actual move"
              />
            </div>
            <div className="flex flex-col justify-start">
              <label
                className="font-semibold text-gray-500 mb-1"
                htmlFor="analysisResult"
              >
                Result
              </label>
              <select
                name="analysisResult"
                value={newAnalysis.analysisResult}
                onChange={handleAddChange}
                className="border border-gray-300 p-2 rounded-lg outline-none focus:ring-2 focus:ring-indigo-200"
              >
                <option value="">Select result</option>
                <option value="correct">Correct</option>
                <option value="incorrect">Incorrect</option>
              </select>
            </div>
            <div className="flex flex-col justify-start min-w-[200px]">
              <label
                className="font-semibold text-gray-500 mb-1"
                htmlFor="remarks"
              >
                Remarks
              </label>
              <input
                type="text"
                name="remarks"
                value={newAnalysis.remarks}
                onChange={handleAddChange}
                className="border border-gray-300 p-2 rounded-lg outline-none focus:ring-2 focus:ring-indigo-200"
                placeholder="Enter remarks"
              />
            </div>
            <div className="mt-2">
              <button
                onClick={submitForm}
                className="py-2 px-6 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 transition duration-200"
                disabled={loading}
              >
                {loading ? "Adding..." : "Add Analysis"}
              </button>
            </div>
          </form>
        </div>
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-white pl-5 bg-gradient-to-r bg-sky-400 to-white rounded-xl">
            Filter Analysis
          </h2>
          <form onSubmit={handleFilter}>
            <div className="flex flex-wrap items-end gap-4 mt-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Stock Name
                </label>
                <input
                  type="text"
                  name="stockName"
                  value={formData.stockName}
                  onChange={handleFilterChange}
                  className="w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                  placeholder="e.g. AAPL"
                />
              </div>

              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  From Date
                </label>
                <input
                  type="date"
                  name="dateFrom"
                  value={formData.dateFrom}
                  onChange={handleFilterChange}
                  className="w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  To Date
                </label>
                <input
                  type="date"
                  name="dateTo"
                  value={formData.dateTo}
                  onChange={handleFilterChange}
                  className="w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Result
                </label>
                <select
                  name="result"
                  value={formData.result}
                  onChange={handleFilterChange}
                  className="w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                >
                  <option value="">All</option>
                  <option value="correct">Correct</option>
                  <option value="incorrect">Incorrect</option>
                </select>
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  className="py-2 px-6 bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500 focus:ring-offset-indigo-200 text-white transition-colors duration-200 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2"
                  disabled={loading}
                >
                  {loading ? "Filtering..." : "Filter Results"}
                </button>
                <button
                  onClick={handleClearFilter}
                  className="py-2 px-6 bg-green-600 focus:ring-offset-indigo-200 text-white transition-colors duration-200 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2"
                  disabled={loading}
                >
                  Clear Filters
                </button>
              </div>
            </div>
          </form>
        </div>
        {editingId && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <h2 className="text-xl font-semibold text-white pl-5 bg-gradient-to-r bg-sky-400 to-white rounded-xl">
              Edit Analysis
            </h2>
            <form className="flex flex-wrap justify-between items-end gap-4 mt-2">
              <div className="flex flex-col justify-start">
                <label
                  className="font-semibold text-gray-500 mb-1"
                  htmlFor="date"
                >
                  Date
                </label>
                <input
                  type="date"
                  name="date"
                  value={editingDetails.date || ""}
                  onChange={handleEditChange}
                  className="border border-gray-300 p-2 rounded-lg outline-none focus:ring-2 focus:ring-indigo-200"
                />
              </div>
              <div className="flex flex-col justify-start">
                <label
                  className="font-semibold text-gray-500 mb-1"
                  htmlFor="name"
                >
                  Stock
                </label>
                <input
                  type="text"
                  name="name"
                  value={editingDetails.name || ""}
                  onChange={handleEditChange}
                  className="border border-gray-300 p-2 rounded-lg outline-none focus:ring-2 focus:ring-indigo-200"
                  placeholder="Enter stock name"
                />
              </div>
              <div className="flex flex-col justify-start">
                <label
                  className="font-semibold text-gray-500 mb-1"
                  htmlFor="directionPlanned"
                >
                  Direction Planned
                </label>
                <input
                  type="text"
                  name="directionPlanned"
                  onChange={handleEditChange}
                  value={editingDetails.directionPlanned || ""}
                  className="border border-gray-300 p-2 rounded-lg outline-none focus:ring-2 focus:ring-indigo-200"
                  placeholder="Enter planned direction"
                />
              </div>
              <div className="flex flex-col justify-start">
                <label
                  className="font-semibold text-gray-500 mb-1"
                  htmlFor="actualMove"
                >
                  Actual Move
                </label>
                <input
                  type="text"
                  name="actualMove"
                  value={editingDetails.actualMove || ""}
                  onChange={handleEditChange}
                  className="border border-gray-300 p-2 rounded-lg outline-none focus:ring-2 focus:ring-indigo-200"
                  placeholder="Enter actual move"
                />
              </div>
              <div className="flex flex-col justify-start">
                <label
                  className="font-semibold text-gray-500 mb-1"
                  htmlFor="analysisResult"
                >
                  Result
                </label>
                <select
                  name="analysisResult"
                  value={editingDetails.analysisResult || ""}
                  onChange={handleEditChange}
                  className="border border-gray-300 p-2 rounded-lg outline-none focus:ring-2 focus:ring-indigo-200"
                >
                  <option value="">Select result</option>
                  <option value="correct">Correct</option>
                  <option value="incorrect">Incorrect</option>
                </select>
              </div>
              <div className="flex flex-col justify-start min-w-[200px]">
                <label
                  className="font-semibold text-gray-500 mb-1"
                  htmlFor="remarks"
                >
                  Remarks
                </label>
                <input
                  type="text"
                  name="remarks"
                  value={editingDetails.remarks || ""}
                  onChange={handleEditChange}
                  className="border border-gray-300 p-2 rounded-lg outline-none focus:ring-2 focus:ring-indigo-200"
                  placeholder="Enter remarks"
                />
              </div>
              <div className="mt-2">
                <button
                  onClick={() => handleEditAnalysis(editingId)}
                  className="py-2 px-6 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 transition duration-200"
                  disabled={editing}
                >
                  {editing ? "Saving..." : "Save"}
                </button>
              </div>
            </form>
          </div>
        )}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="flex justify-between items-center p-4 border-b">
            <h2 className="text-xl font-semibold text-gray-800">
              Analysis Results
            </h2>
            <span className="bg-indigo-100 text-indigo-800 text-sm font-medium px-2.5 py-0.5 rounded">
              {analyses.length} Records
            </span>
          </div>
          {error && (
            <div className="bg-red-50 text-red-800 p-3 text-center">
              {error}
            </div>
          )}
          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Loading...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Date
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Stock
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Planned Direction
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Actual Move
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Result
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Remarks
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Edit
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Delete
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {analyses.length > 0 &&
                    analyses.map((analysis) => (
                      <tr
                        key={analysis._id || analysis.id}
                        className="hover:bg-gray-50"
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(analysis.date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {analysis.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                          ${
                            analysis.directionPlanned === "bullish"
                              ? "bg-green-100 text-green-800"
                              : analysis.directionPlanned === "bearish"
                              ? "bg-red-100 text-red-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                          >
                            {analysis.directionPlanned}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                          ${
                            analysis.actualMove === "upward"
                              ? "bg-green-100 text-green-800"
                              : analysis.actualMove === "downward"
                              ? "bg-red-100 text-red-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                          >
                            {analysis.actualMove}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                          ${
                            analysis.analysisResult === "correct"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                          >
                            {analysis.analysisResult}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {analysis.remarks || "-"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <button
                            onClick={() => setEditingId(analysis._id)}
                            className="bg-green-500 text-white px-4 py-1 rounded-full text-center flex justify-center items-center cursor-pointer"
                          >
                            Edit
                          </button>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <button
                            onClick={() => handleDeleteAnalysis(analysis._id)}
                            className="bg-red-500 text-white px-4 py-1 rounded-full text-center flex justify-center items-center cursor-pointer"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}
          {!loading && analyses.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No analysis records found.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
