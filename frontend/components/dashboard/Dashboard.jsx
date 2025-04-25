// // src/components/dashboard/Dashboard.jsx
// import React, { useEffect, useState } from "react";
// import { useSelector, useDispatch } from "react-redux";
// import { Link } from "react-router-dom";
// import ProjectCard from "./ProjectCard";
// import { getProjects, createProject } from "../../src/actions/project";

// const Dashboard = () => {
//   const dispatch = useDispatch();
//   const { projects, loading } = useSelector((state) => state.project);
//   const { user } = useSelector((state) => state.auth);

//   const [createDialogOpen, setCreateDialogOpen] = useState(false);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [sortBy, setSortBy] = useState("date");
//   const [filterOwner, setFilterOwner] = useState("all");

//   const [formData, setFormData] = useState({
//     title: "",
//     description: "",
//     client: "",
//     location: "",
//     projectType: "residential",
//   });

//   useEffect(() => {
//     dispatch(getProjects());
//   }, [dispatch]);

//   const handleOpenCreateDialog = () => {
//     setCreateDialogOpen(true);
//   };

//   const handleCloseCreateDialog = () => {
//     setCreateDialogOpen(false);
//     // Reset form data
//     setFormData({
//       title: "",
//       description: "",
//       client: "",
//       location: "",
//       projectType: "residential",
//     });
//   };

//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setFormData({ ...formData, [name]: value });
//   };

//   const handleCreateProject = () => {
//     const projectData = {
//       ...formData,
//       metadata: {
//         client: formData.client,
//         location: formData.location,
//         projectType: formData.projectType,
//       },
//     };

//     // Remove the fields that are not part of the Project model
//     delete projectData.client;
//     delete projectData.location;
//     delete projectData.projectType;

//     dispatch(createProject(projectData));
//     handleCloseCreateDialog();
//   };

//   // Filter and sort projects
//   const getFilteredProjects = () => {
//     if (!projects || !Array.isArray(projects)) return [];

//     return projects
//       .filter((project) => {
//         // Search filter
//         const searchMatch =
//           project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
//           (project.description &&
//             project.description
//               .toLowerCase()
//               .includes(searchTerm.toLowerCase()));

//         // Owner filter
//         const ownerMatch =
//           filterOwner === "all" ||
//           (filterOwner === "owned" && project.owner === user._id) ||
//           (filterOwner === "shared" && project.owner !== user._id);

//         return searchMatch && ownerMatch;
//       })
//       .sort((a, b) => {
//         // Sort options
//         switch (sortBy) {
//           case "title":
//             return a.title.localeCompare(b.title);
//           case "date":
//           default:
//             return new Date(b.createdAt) - new Date(a.createdAt);
//         }
//       });
//   };

//   const filteredProjects = getFilteredProjects();

//   if (loading) {
//     return (
//       <div className="flex justify-center items-center min-h-screen">
//         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
//       </div>
//     );
//   }

//   return (
//     <div className="container mx-auto px-4 py-8">
//       <div className="flex justify-between items-center mb-8">
//         <h1 className="text-3xl font-bold">My Projects</h1>
//         <button
//           onClick={handleOpenCreateDialog}
//           className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center"
//         >
//           <svg
//             xmlns="http://www.w3.org/2000/svg"
//             className="h-5 w-5 mr-2"
//             viewBox="0 0 20 20"
//             fill="currentColor"
//           >
//             <path
//               fillRule="evenodd"
//               d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
//               clipRule="evenodd"
//             />
//           </svg>
//           Create Project
//         </button>
//       </div>

//       {/* Filters and search */}
//       <div className="flex flex-col md:flex-row gap-4 mb-8">
//         <div className="relative flex-grow">
//           <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//             <svg
//               className="h-5 w-5 text-gray-400"
//               fill="currentColor"
//               viewBox="0 0 20 20"
//             >
//               <path
//                 fillRule="evenodd"
//                 d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
//                 clipRule="evenodd"
//               />
//             </svg>
//           </div>
//           <input
//             type="text"
//             placeholder="Search projects..."
//             className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
//             value={searchTerm}
//             onChange={(e) => setSearchTerm(e.target.value)}
//           />
//         </div>

//         <div className="flex gap-2">
//           <button
//             className="border border-gray-300 px-4 py-2 rounded-md hover:bg-gray-50 flex items-center"
//             onClick={() => {
//               // Cycle through filter options
//               const filters = ["all", "owned", "shared"];
//               const currentIndex = filters.indexOf(filterOwner);
//               const nextIndex = (currentIndex + 1) % filters.length;
//               setFilterOwner(filters[nextIndex]);
//             }}
//           >
//             <svg
//               xmlns="http://www.w3.org/2000/svg"
//               className="h-5 w-5 mr-2"
//               viewBox="0 0 20 20"
//               fill="currentColor"
//             >
//               <path
//                 fillRule="evenodd"
//                 d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z"
//                 clipRule="evenodd"
//               />
//             </svg>
//             {filterOwner === "all"
//               ? "All Projects"
//               : filterOwner === "owned"
//               ? "My Projects"
//               : "Shared With Me"}
//           </button>

//           <button
//             className="border border-gray-300 px-4 py-2 rounded-md hover:bg-gray-50 flex items-center"
//             onClick={() => {
//               // Toggle sort option
//               setSortBy(sortBy === "date" ? "title" : "date");
//             }}
//           >
//             <svg
//               xmlns="http://www.w3.org/2000/svg"
//               className="h-5 w-5 mr-2"
//               viewBox="0 0 20 20"
//               fill="currentColor"
//             >
//               <path d="M5 4a1 1 0 00-2 0v7.268a2 2 0 000 3.464V16a1 1 0 102 0v-1.268a2 2 0 000-3.464V4zM11 4a1 1 0 10-2 0v1.268a2 2 0 000 3.464V16a1 1 0 102 0V8.732a2 2 0 000-3.464V4zM16 3a1 1 0 011 1v7.268a2 2 0 010 3.464V16a1 1 0 11-2 0v-1.268a2 2 0 010-3.464V4a1 1 0 011-1z" />
//             </svg>
//             Sort by: {sortBy === "date" ? "Date" : "Title"}
//           </button>
//         </div>
//       </div>

//       {/* Project grid */}
//       {filteredProjects.length === 0 ? (
//         <div className="flex flex-col items-center justify-center bg-white rounded-lg shadow-sm p-8 min-h-[300px] text-center">
//           <svg
//             xmlns="http://www.w3.org/2000/svg"
//             className="h-16 w-16 text-gray-400 mb-4"
//             fill="none"
//             viewBox="0 0 24 24"
//             stroke="currentColor"
//           >
//             <path
//               strokeLinecap="round"
//               strokeLinejoin="round"
//               strokeWidth={1}
//               d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
//             />
//           </svg>
//           <h2 className="text-xl font-semibold mb-2">No projects found</h2>
//           <p className="text-gray-500 mb-6">
//             {searchTerm
//               ? `No projects match your search "${searchTerm}"`
//               : "You don't have any projects yet. Create your first project to get started."}
//           </p>
//           <button
//             onClick={handleOpenCreateDialog}
//             className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center"
//           >
//             <svg
//               xmlns="http://www.w3.org/2000/svg"
//               className="h-5 w-5 mr-2"
//               viewBox="0 0 20 20"
//               fill="currentColor"
//             >
//               <path
//                 fillRule="evenodd"
//                 d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
//                 clipRule="evenodd"
//               />
//             </svg>
//             Create New Project
//           </button>
//         </div>
//       ) : (
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//           {filteredProjects.map((project) => (
//             <ProjectCard key={project._id} project={project} />
//           ))}
//         </div>
//       )}

//       {/* Create Project Dialog */}
//       {createDialogOpen && (
//         <div className="fixed inset-0 z-50 overflow-y-auto">
//           <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
//             <div
//               className="fixed inset-0 transition-opacity"
//               aria-hidden="true"
//             >
//               <div
//                 className="absolute inset-0 bg-gray-500 opacity-75"
//                 onClick={handleCloseCreateDialog}
//               ></div>
//             </div>

//             <span
//               className="hidden sm:inline-block sm:align-middle sm:h-screen"
//               aria-hidden="true"
//             >
//               &#8203;
//             </span>

//             <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
//               <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
//                 <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">
//                   Create New Project
//                 </h3>

//                 <div className="mb-4">
//                   <label
//                     htmlFor="title"
//                     className="block text-sm font-medium text-gray-700 mb-1"
//                   >
//                     Project Title*
//                   </label>
//                   <input
//                     type="text"
//                     id="title"
//                     name="title"
//                     className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
//                     value={formData.title}
//                     onChange={handleInputChange}
//                     required
//                   />
//                 </div>

//                 <div className="mb-4">
//                   <label
//                     htmlFor="description"
//                     className="block text-sm font-medium text-gray-700 mb-1"
//                   >
//                     Description
//                   </label>
//                   <textarea
//                     id="description"
//                     name="description"
//                     rows="3"
//                     className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
//                     value={formData.description}
//                     onChange={handleInputChange}
//                   ></textarea>
//                 </div>

//                 <div className="mb-4">
//                   <label
//                     htmlFor="projectType"
//                     className="block text-sm font-medium text-gray-700 mb-1"
//                   >
//                     Project Type
//                   </label>
//                   <select
//                     id="projectType"
//                     name="projectType"
//                     className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
//                     value={formData.projectType}
//                     onChange={handleInputChange}
//                   >
//                     <option value="residential">Residential</option>
//                     <option value="commercial">Commercial</option>
//                     <option value="industrial">Industrial</option>
//                     <option value="landscape">Landscape</option>
//                     <option value="interior">Interior Design</option>
//                     <option value="other">Other</option>
//                   </select>
//                 </div>

//                 <div className="mb-4">
//                   <label
//                     htmlFor="client"
//                     className="block text-sm font-medium text-gray-700 mb-1"
//                   >
//                     Client
//                   </label>
//                   <input
//                     type="text"
//                     id="client"
//                     name="client"
//                     className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
//                     value={formData.client}
//                     onChange={handleInputChange}
//                   />
//                 </div>

//                 <div className="mb-4">
//                   <label
//                     htmlFor="location"
//                     className="block text-sm font-medium text-gray-700 mb-1"
//                   >
//                     Location
//                   </label>
//                   <input
//                     type="text"
//                     id="location"
//                     name="location"
//                     className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
//                     value={formData.location}
//                     onChange={handleInputChange}
//                   />
//                 </div>
//               </div>

//               <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
//                 <button
//                   type="button"
//                   className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
//                   onClick={handleCreateProject}
//                   disabled={!formData.title}
//                 >
//                   Create Project
//                 </button>
//                 <button
//                   type="button"
//                   className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:w-auto sm:text-sm"
//                   onClick={handleCloseCreateDialog}
//                 >
//                   Cancel
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default Dashboard;
// src/components/dashboard/Dashboard.jsx
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { getProjects, createProject } from "../../src/actions/project";
// import ProjectCard from "./ProjectCard";

// import { useNavigate } from "react-router-dom";

const ProjectCard = ({ project }) => {
  const navigate = useNavigate();

  const handleOpenProject = (project) => {
    console.log("Project data:", project);
    console.log("Drawings:", project.drawings);

    if (project.drawings && project.drawings.length > 0) {
      console.log("Navigating to drawing:", project.drawings[0]);
      navigate(`/projects/${project._id}/drawings/${project.drawings[0]}`);
    } else {
      console.log("No drawings found for this project");
      navigate(`/projects/${project._id}`);
    }
  };

  return (
    <div className="project-card" onClick={handleOpenProject}>
      <h3>{project.name}</h3>
      <p>{project.description}</p>
    </div>
  );
};

const Dashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Get projects from Redux store
  const projectState = useSelector((state) => state.project);
  const { projects, loading } = projectState;

  // For the user data
  const authState = useSelector((state) => state.auth);
  const { user } = authState;

  // Local state
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("date");
  const [filterOwner, setFilterOwner] = useState("all");

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    client: "",
    location: "",
    projectType: "residential",
  });

  // Fetch projects when component mounts
  useEffect(() => {
    dispatch(getProjects());
  }, [dispatch]);

  const handleOpenCreateDialog = () => {
    setCreateDialogOpen(true);
  };

  const handleCloseCreateDialog = () => {
    setCreateDialogOpen(false);
    // Reset form data
    setFormData({
      title: "",
      description: "",
      client: "",
      location: "",
      projectType: "residential",
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleCreateProject = async () => {
    const projectData = {
      title: formData.title,
      description: formData.description,
      metadata: {
        client: formData.client,
        location: formData.location,
        projectType: formData.projectType,
      },
    };

    // Create project and navigate to its page if successful
    const result = await dispatch(createProject(projectData));
    if (result && result._id) {
      // Navigate to the project detail view
      navigate(`/projects/${result._id}`);
    }

    handleCloseCreateDialog();
  };

  // Filter and sort projects
  const getFilteredProjects = () => {
    // Make sure projects is an array before filtering
    if (!projects || !Array.isArray(projects)) {
      return [];
    }

    return projects
      .filter((project) => {
        // Search filter
        const searchMatch =
          project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (project.description &&
            project.description
              .toLowerCase()
              .includes(searchTerm.toLowerCase()));

        // Owner filter (if user is available)
        const ownerMatch =
          filterOwner === "all" ||
          (user && filterOwner === "owned" && project.owner === user._id) ||
          (user && filterOwner === "shared" && project.owner !== user._id);

        return searchMatch && ownerMatch;
      })
      .sort((a, b) => {
        // Sort options
        switch (sortBy) {
          case "title":
            return a.title.localeCompare(b.title);
          case "date":
          default:
            return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
        }
      });
  };

  const filteredProjects = getFilteredProjects();

  // Create mock projects for demonstration if needed
  const mockProjects = [
    {
      _id: "mock1",
      title: "Modern Residential Home",
      description:
        "A 3-bedroom residential project with open floor plan and sustainable features",
      createdAt: new Date().toISOString(),
      metadata: {
        projectType: "residential",
        client: "Smith Family",
        location: "Portland, OR",
      },
    },
    {
      _id: "mock2",
      title: "Downtown Office Space",
      description:
        "Commercial office redesign for a tech startup with collaborative workspaces",
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      metadata: {
        projectType: "commercial",
        client: "TechWorks Inc.",
        location: "Seattle, WA",
      },
    },
    {
      _id: "mock3",
      title: "City Park Redesign",
      description:
        "Landscape architecture project for central city park with sustainable water features",
      createdAt: new Date(Date.now() - 172800000).toISOString(),
      metadata: {
        projectType: "landscape",
        client: "Metro Parks Department",
        location: "Chicago, IL",
      },
    },
  ];

  // Use either real projects or mock data
  const displayProjects =
    filteredProjects.length > 0 ? filteredProjects : mockProjects;

  // Show loading state if projects are being fetched
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">My Projects</h1>
        <button
          onClick={handleOpenCreateDialog}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-2"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
              clipRule="evenodd"
            />
          </svg>
          Create Project
        </button>
      </div>

      {/* Filters and search */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-grow">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg
              className="h-5 w-5 text-gray-400"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search projects..."
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex gap-2">
          <button
            className="border border-gray-300 px-4 py-2 rounded-md hover:bg-gray-50 flex items-center"
            onClick={() => {
              // Cycle through filter options
              const filters = ["all", "owned", "shared"];
              const currentIndex = filters.indexOf(filterOwner);
              const nextIndex = (currentIndex + 1) % filters.length;
              setFilterOwner(filters[nextIndex]);
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z"
                clipRule="evenodd"
              />
            </svg>
            {filterOwner === "all"
              ? "All Projects"
              : filterOwner === "owned"
              ? "My Projects"
              : "Shared With Me"}
          </button>

          <button
            className="border border-gray-300 px-4 py-2 rounded-md hover:bg-gray-50 flex items-center"
            onClick={() => {
              // Toggle sort option
              setSortBy(sortBy === "date" ? "title" : "date");
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M5 4a1 1 0 00-2 0v7.268a2 2 0 000 3.464V16a1 1 0 102 0v-1.268a2 2 0 000-3.464V4zM11 4a1 1 0 10-2 0v1.268a2 2 0 000 3.464V16a1 1 0 102 0V8.732a2 2 0 000-3.464V4zM16 3a1 1 0 011 1v7.268a2 2 0 010 3.464V16a1 1 0 11-2 0v-1.268a2 2 0 010-3.464V4a1 1 0 011-1z" />
            </svg>
            Sort by: {sortBy === "date" ? "Date" : "Title"}
          </button>
        </div>
      </div>

      {/* Project grid */}
      {displayProjects.length === 0 ? (
        <div className="flex flex-col items-center justify-center bg-white rounded-lg shadow-sm p-8 min-h-[300px] text-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-16 w-16 text-gray-400 mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
            />
          </svg>
          <h2 className="text-xl font-semibold mb-2">No projects found</h2>
          <p className="text-gray-500 mb-6">
            {searchTerm
              ? `No projects match your search "${searchTerm}"`
              : "You don't have any projects yet. Create your first project to get started."}
          </p>
          <button
            onClick={handleOpenCreateDialog}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                clipRule="evenodd"
              />
            </svg>
            Create New Project
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayProjects.map((project) => (
            <div
              key={project._id}
              className="bg-white rounded-lg shadow-sm overflow-hidden h-full flex flex-col"
            >
              {/* Project Image/Placeholder */}
              <div
                className="h-36 w-full flex items-center justify-center"
                style={{
                  backgroundImage: `linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)`,
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-16 w-16 text-white opacity-70"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>

              <div className="p-4 flex-grow">
                <h2 className="text-xl font-semibold mb-2">{project.title}</h2>

                <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                  {project.description || "No description provided."}
                </p>

                <div className="flex flex-wrap gap-2 mb-2">
                  {project.metadata?.projectType && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {project.metadata.projectType.charAt(0).toUpperCase() +
                        project.metadata.projectType.slice(1)}
                    </span>
                  )}

                  {project.metadata?.client && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 mr-1"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z"
                          clipRule="evenodd"
                        />
                      </svg>
                      {project.metadata.client}
                    </span>
                  )}

                  {project.metadata?.location && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 mr-1"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      {project.metadata.location}
                    </span>
                  )}
                </div>
              </div>

              <div className="border-t border-gray-200 px-4 py-3 flex justify-between items-center">
                <span className="text-xs text-gray-500">
                  {project.createdAt &&
                    new Date(project.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                </span>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => {
                      if (project.drawings && project.drawings.length > 0) {
                        navigate(
                          `/projects/${project._id}/drawings/${project.drawings[0]}`
                        );
                      } else {
                        // Create new drawing option here
                        navigate(`/projects/${project._id}`);
                      }
                    }}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    Open
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Project Dialog */}
      {createDialogOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 transition-opacity"
              aria-hidden="true"
            >
              <div
                className="absolute inset-0 bg-gray-500 opacity-75"
                onClick={handleCloseCreateDialog}
              ></div>
            </div>

            <span
              className="hidden sm:inline-block sm:align-middle sm:h-screen"
              aria-hidden="true"
            >
              &#8203;
            </span>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">
                  Create New Project
                </h3>

                <div className="mb-4">
                  <label
                    htmlFor="title"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Project Title*
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="mb-4">
                  <label
                    htmlFor="description"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    value={formData.description}
                    onChange={handleInputChange}
                  ></textarea>
                </div>

                <div className="mb-4">
                  <label
                    htmlFor="projectType"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Project Type
                  </label>
                  <select
                    id="projectType"
                    name="projectType"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    value={formData.projectType}
                    onChange={handleInputChange}
                  >
                    <option value="residential">Residential</option>
                    <option value="commercial">Commercial</option>
                    <option value="industrial">Industrial</option>
                    <option value="landscape">Landscape</option>
                    <option value="interior">Interior Design</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="mb-4">
                  <label
                    htmlFor="client"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Client
                  </label>
                  <input
                    type="text"
                    id="client"
                    name="client"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    value={formData.client}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="mb-4">
                  <label
                    htmlFor="location"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Location
                  </label>
                  <input
                    type="text"
                    id="location"
                    name="location"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    value={formData.location}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={handleCreateProject}
                  disabled={!formData.title}
                >
                  Create Project
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:w-auto sm:text-sm"
                  onClick={handleCloseCreateDialog}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
