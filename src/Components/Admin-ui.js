/* eslint-disable react-hooks/exhaustive-deps */
import "./Admin-ui.css";
import Icons from "../assets/sprite.svg";
import UserDetail from "./UserDetail";
import React, { useEffect, useState } from "react";
import axios from "axios";
import UpdateUser from "./UpdateUser";
import { Box } from "@mui/system";
import {CircularProgress} from "@mui/material";
import { SentimentDissatisfied } from "@mui/icons-material";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


function AdminUi() {
  const [usersData, setUsersData] = useState({ all: [], selected: -1 });
  const [filteredData, setFilteredData] = useState([]);
  const [searchCategory, setSearchCategory] = useState("all");
  const [searchText, setSearchText] = useState("");
  const [debounceTimeout, setDebounceTimeout] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [records , setRecords] = useState([]);
  const [isLoading , setIsLoading] = useState(false);
  const [ npage , setNPage] = useState(1);

  //pagination
  const perPageRecords = 10;
  const lastIndex = currentPage * perPageRecords;
  const firstIndex = lastIndex - perPageRecords;
  const numbers = [...new Array(npage + 1).keys()].slice(1);
  const prevPageHandler = () => {
    if (currentPage !== 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };
  const nextPageHandler = () => {
    if (currentPage !== npage) {
      setCurrentPage((prev) => prev + 1);
    }
  };
  const currentPageHandler = (no) => {
    setCurrentPage(no);
  };
  const doubleJumpPrev = () => {
    if (currentPage > 2) {
      setCurrentPage((prev) => prev - 2);
    }
  }
  const doubleJumpNext = () => {
    if (currentPage < npage - 1) {
      setCurrentPage((prev) => prev + 2);
    }
  }

  //fetching userData from backend
  const fetchUsersData = async () => {
    try {
      setIsLoading(true);
      let response = await axios.get(
        `https://geektrust.s3-ap-southeast-1.amazonaws.com/adminui-problem/members.json`
      );
      setIsLoading(false);
      setUsersData({ ...usersData, all: response.data });
      
      setRecords(response.data.slice(firstIndex, lastIndex));
      setNPage(Math.ceil(response.data.length / perPageRecords));

    } catch(error){
      console.log("error" , error);
      setIsLoading(false);
      toast.error("Something went wrong", {
        position: "bottom-left",
        autoClose: 5000,
        theme: "colored",
      });
      
    }
  };

  //deleting userData from the UI
  const deleteUserDetail = (userId) => {
    let usersRecords = usersData.all;
    let index1 = usersRecords.findIndex((userData) => userData.id === userId);
    usersRecords.splice(index1, 1);
    setUsersData({...usersData, all:usersRecords});
    if(searchText){
      let filteredRecords = filteredData;
      let index1 = filteredRecords.findIndex((userData) => userData.id === userId);
      filteredRecords.splice(index1, 1);
      setFilteredData(filteredRecords);
      setRecords(filteredData.slice(firstIndex, lastIndex));
      setNPage(Math.ceil(filteredData.length / perPageRecords))
    }else{
      setRecords(usersData.all.slice(firstIndex, lastIndex));
      setNPage(Math.ceil(usersData.all.length / perPageRecords));
    }
  };

  useEffect(() => {
    const onLoadHandler = async () => {
      await fetchUsersData();
    };
    onLoadHandler();
  }, []);
  
  useEffect(() => {
    console.log(npage , "npage" , currentPage , "currentPage")
   if(records.length === 0 && currentPage > npage && npage > 0){
        setCurrentPage(npage);
   }
  },[records])

  useEffect(()=>{
    if(searchText){
      console.log("harsh 2nd" , records, currentPage)
      setRecords(filteredData.slice(firstIndex, lastIndex))
    }else {
      setRecords(usersData.all.slice(firstIndex, lastIndex))
    } 
  },[currentPage,filteredData])

  

  //Setting the selected userId
  const selectUserData = (id) => {
    setUsersData({ ...usersData, selected: id });
  };
  const selectSearchCategory = (e) => {
    setSearchCategory(e.target.value);
    performSearch(searchText, e.target.value);
  };
  const searchInputHandler = (e) => {
    setSearchText(e.target.value);
  };

  const performSearch = (text, category) => {
    if(!text){
      setFilteredData([]);
    }
    text = text.trim()
    let newData;
    if(category === "all"){
      newData = usersData.all.filter((user) => (
        [user.name , user.email, user.role].some((value) =>(
          value.toLowerCase().includes(text.toLowerCase())
        ))
      ))
    }else{
       newData = usersData.all.filter(
        (userData) => userData[category].toLowerCase().includes(text.toLowerCase())
      );
    }
    setFilteredData(newData);
    setNPage(Math.ceil(newData.length / perPageRecords));

  };

//debounceSearch implemenation
  const debounceSearch = (event, debounceTimeout, category) => {
    if (debounceTimeout !== null) {
      clearTimeout(debounceTimeout);
    }
    let timeOut = setTimeout(() => performSearch(event, category), 500);
    setDebounceTimeout(timeOut);
  };

 const handleChecked = (e) => {
   const {name , checked} = e.target;
   if(searchText){
    if(name === "allData"){
      let len =  Math.floor(filteredData.length/10) + 1;
      let lastValue;
      if(len === currentPage) {
         lastValue = firstIndex + filteredData.length % 10;
      }else{
        lastValue = lastIndex;
      }
      for(let i = firstIndex; i < lastValue; i++){
       filteredData[i]["isChecked"] = checked;
      }
    }else{
        let index = filteredData.findIndex((user) => user.email === name);
        filteredData[index]["isChecked"] = checked;
      }
      setRecords(filteredData.slice(firstIndex, lastIndex));
   }else{
    if(name === "allData"){
      let len =  Math.floor(usersData.all.length/10) + 1
      let lastValue;
      if(len === currentPage) {
         lastValue = firstIndex + usersData.all.length % 10;
      }else{
        lastValue = lastIndex;
      }
      for(let i = firstIndex; i < lastValue; i++){
       usersData["all"][i]["isChecked"] = checked;
      }
    }else{
      let index = usersData.all.findIndex((user) => user.email === name);
      usersData["all"][index]["isChecked"] = checked;
    }
     setRecords(usersData.all.slice(firstIndex, lastIndex));
   }
 }

  const handleDeleteAll = () => {
    let newData = usersData.all.filter((record) => record.isChecked !== true);
    setUsersData({...usersData , all:newData});
    if(searchText){ 
      let data = filteredData.filter((record) => record.isChecked !== true);
      setFilteredData(data);
      setNPage(Math.ceil(data.length / perPageRecords));
      setRecords(data.slice(firstIndex, lastIndex)) 
    }else{
      setRecords(newData.slice(firstIndex, lastIndex));
      setNPage(Math.ceil(newData.length / perPageRecords));
    }
 
  }
  return (
    
    <div className="container" id="page">
      <ToastContainer />
      <header className="header">
        <form action="" className="search">
          <input
            type="text"
            className="search__input"
            placeholder="Search by name, email or role"
            value={searchText}
            onChange={(e) => {
              searchInputHandler(e);
              debounceSearch(e.target.value, debounceTimeout, searchCategory);
            }}
          />
          <button className="search__btn">
            <svg className="search__icon">
              <use xlinkHref={`${Icons}#icon-magnifying-glass`} />
            </svg>
          </button>
        </form>
        <div>
          <select
            className="dropdown"
            name="dropdown"
            id="dropdown"
            defaultValue={"DEFAULT"}
            onChange={selectSearchCategory}
          >
            <option disabled value="DEFAULT">
              All fields
            </option>
            <option value ="all">All</option>
            <option value="name">Name</option>
            <option value="email">Email</option>
            <option value="role">Role</option>
            <option value="id">Id</option>
          </select>
        </div>
      </header>
      <section className="updatingForm" id="updataingForm">
        {usersData.selected !== -1 &&
          usersData.all.map((userData) => {
            if (userData.id === usersData.selected) {
              return (
                <UpdateUser
                  key={userData.id}
                  name={userData.name}
                  email={userData.email}
                  role={userData.role}
                  usersData={usersData.all}
                  id={userData.id}
                  selectUserData={selectUserData}
                />
              );
            } else {
              return null;
            }
          })}
      </section>
      {isLoading ? 
               (<div className="isloading">
                  <CircularProgress />
                  <div>Loading users data...</div>
                </div>)
                :
  (
    <> 
    {records.length ?
    <>
    <section className="display">
     <table>
       <thead>
         <tr>
           <th>
             <input className="checkedUser" type="checkbox" 
             checked={records.filter((record) => record?.isChecked !== true).length < 1} 
             onChange={handleChecked}
             name="allData" />
           </th>
           <th>Name</th>
           <th>Email</th>
           <th>Role</th>
           <th>Actions</th>
         </tr>
       </thead>
       <tbody>
         { records.map((userData) => (
               <UserDetail
                 key={userData.id}
                 name={userData.name}
                 email={userData.email}
                 role={userData.role}
                 deleteUserDetail={() => deleteUserDetail(userData.id)}
                 selectUserData={() => selectUserData(userData.id)}
                 handleChecked={handleChecked}
                 userRecord={userData}
               />
             ))
           }
       </tbody>
     </table>
   </section>
   <section className="pagination">
     <div className="delete-btn">
       <button className="btn" onClick={handleDeleteAll}>Delete Selected</button>
     </div>
     <ul className="pagination__items">
       <li className="pagination__item">
         <button className={`pagination__btn ${
                 currentPage <= 2 && "disabled"
               }`} onClick={doubleJumpPrev}>
           <svg className="pagination__icon">
             <use xlinkHref={`${Icons}#icon-controller-fast-backward`} />
           </svg>
         </button>
       </li>
       <li className="pagination__item">
         <button className={`pagination__btn ${
                 currentPage === 1 && "disabled"
               }`} onClick={prevPageHandler}>
           <svg className="pagination__icon">
             <use xlinkHref={`${Icons}#icon-triangle-left`} />
           </svg>
         </button>
       </li>
       {numbers.map((number) => {
         return (
           <li
             className="pagination__item"
             key={number}
           >
             <button
               className={`pagination__btn ${
                 currentPage === number && "active"
               }`}
               onClick={() => currentPageHandler(number)}
             >
               {number}
             </button>
           </li>
         );
       })}
       <li className="pagination__item">
         <button className={`pagination__btn ${
                 currentPage === npage && "disabled"
               }`} onClick={nextPageHandler}>
           <svg className="pagination__icon">
             <use xlinkHref={`${Icons}#icon-triangle-right`} />
           </svg>
         </button>
       </li>
       <li className="pagination__item">
         <button className={`pagination__btn ${
                 currentPage >= npage - 1 && "disabled"
               }`} onClick={doubleJumpNext}>
           <svg className="pagination__icon">
             <use xlinkHref={`${Icons}#icon-controller-fast-forward`} />
           </svg>
         </button>
       </li>
     </ul>
   </section>
    </>
    :  (
      <Box className="isloading">
        <SentimentDissatisfied />
        <Box>No users found</Box>
      </Box>
    )
   }        
      </>
         )
      }
    </div>
  );
}

export default AdminUi;
