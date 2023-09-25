import "./UpdateUser.css";
import React, { useEffect, useRef, useState } from "react";

function UpdateUser({ name, email, role, usersData, id, selectUserData }) {
  const [updatedUserDetail, setUpdatedUserDetail] = useState({
    name: name,
    email: email,
    role: role,
  });
  const inputEle = useRef(null);
  
  const userUpdateHandler = (e) => {
    const [key, value] = [e.target.name, e.target.value];
    setUpdatedUserDetail((prevData) => ({ ...prevData, [key]: value }));
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    window.location.href = "#page";
    let index = usersData.findIndex((userData) => userData.id === id);
    usersData[index]["name"] = updatedUserDetail.name;
    usersData[index]["email"] = updatedUserDetail.email;
    usersData[index]["role"] = updatedUserDetail.role;
    selectUserData(-1);
  };
  const handleCancel = (e) => {
    e.preventDefault();
    window.location.href = "#page";
    selectUserData(-1);
  };
  useEffect(()=>{
   setTimeout(() => {
    inputEle.current.focus();
  }, 100);
  },[])
  return (
    <form className="form">
      <div className="form__element">
        <input
          ref={inputEle}
          type="text"
          className="form__input"
          id="name"
          name="name"
          placeholder="name"
          required
          value={updatedUserDetail.name}
          onChange={userUpdateHandler}
        />
        <label htmlFor="name" className="form__label">
          Name
        </label>
      </div>
      <div className="form__element">
        <input
          type="email"
          className="form__input"
          id="email"
          name="email"
          placeholder="email"
          required
          value={updatedUserDetail.email}
          onChange={userUpdateHandler}
        />
        <label htmlFor="email" className="form__label">
          Email
        </label>
      </div>
      <div className="form__element">
        <input
          type="text"
          className="form__input"
          id="role"
          name="role"
          placeholder="role"
          required
          value={updatedUserDetail.role}
          onChange={userUpdateHandler}
        />
        <label htmlFor="role" className="form__label">
          Role
        </label>
      </div>
      <div className="form__element form__btn">
        <button className="form__btn--update" onClick={handleSubmit}>
          Update
        </button>
        <button className="form__btn--cancel" onClick={handleCancel}>
          Cancel
        </button>
      </div>
    </form>
  );
}

export default UpdateUser;
