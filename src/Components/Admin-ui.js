/* eslint-disable react-hooks/exhaustive-deps */
import "./Admin-ui.css";
import Icons from "../assets/sprite.svg";
import UserDetail from "./UserDetail";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useSnackbar } from "notistack";
import UpdateUser from "./UpdateUser";

function AdminUi() {
  const [usersData, setUsersData] = useState({ all: [], selected: -1 });
  const { enqueueSnackbar } = useSnackbar();
  const [filteredData, setFilteredData] = useState([]);
  const [searchCategory, setSearchCategory] = useState("all");
  const [searchText, setSearchText] = useState("");
  const [debounceTimeout, setDebounceTimeout] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [records , setRecords] = useState([]);
  
  //pagination
  const perPageRecords = 10;
  const lastIndex = currentPage * perPageRecords;
  const firstIndex = lastIndex - perPageRecords;

  let npage = Math.ceil(usersData.all.length / perPageRecords);
  if(searchText) {
    npage = Math.ceil(filteredData.length / perPageRecords);
  }

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
      let response = await axios.get(
        `https://geektrust.s3-ap-southeast-1.amazonaws.com/adminui-problem/members.json`
      );
      setUsersData({ ...usersData, all: response.data });
      console.log(response.data);
      setRecords(response.data.slice(firstIndex, lastIndex));
      return response.data;
    } catch {
      enqueueSnackbar("Something went wrong", {
        autoHideDuration: 3000,
        variant: "error",
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
    }else{
      setRecords(usersData.all.slice(firstIndex, lastIndex));
    }
  };

  useEffect(() => {
    const onLoadHandler = async () => {
      await fetchUsersData();
    };
    onLoadHandler();
  }, []);
  
  useEffect(()=>{
    if(searchText){
      setRecords(filteredData.slice(firstIndex, lastIndex))
    }else{
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
   
    console.log(newData);
    setFilteredData(newData);
  };

  const debounceSearch = (event, debounceTimeout, category) => {
    if (debounceTimeout !== null) {
      clearTimeout(debounceTimeout);
    }
    let timeOut = setTimeout(() => performSearch(event, category), 500);
    setDebounceTimeout(timeOut);
  };
  // console.log(filteredData , "fi" , "all", usersData.all )
 const handleChecked = (e) => {
   const {name , checked} = e.target;
   console.log(name , checked)
   if(searchText){
    if(name === "allData"){
      let id = new Set();
      let len =  Math.floor(filteredData.length/10) + 1;
      let lastValue;
      if(len === currentPage) {
         lastValue = firstIndex + filteredData.length % 10;
      }else{
        lastValue = lastIndex;
      }
      for(let i = firstIndex; i < lastValue; i++){
       filteredData[i]["isChecked"] = checked;
       id.add(filteredData.id);
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
  
  
  //  console.log(newData ,"newData");
  //  console.log(usersData.all,"all")
 }
  const handleDeleteAll = () => {
    let newData = usersData.all.filter((record) => record.isChecked !== true);
    setUsersData({...usersData , all:newData});
    if(searchText){
      let data = filteredData.filter((record) => record.isChecked !== true);
      setFilteredData(data);
      setRecords(data.slice(firstIndex, lastIndex))
    }else
    setRecords(newData.slice(firstIndex, lastIndex));
  }
  return (
    <div className="container" id="page">
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
            {records.length
              ? records.map((userData) => (
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
              : null}
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
    </div>
  );
}

export default AdminUi;
