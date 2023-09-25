import "./UserDetail.css";
import Icons from "../assets/sprite.svg";


function UserDetail({ name, email, role, deleteUserDetail, selectUserData,userRecord,handleChecked}) {
  return (
    <tr className={`row ${userRecord?.isChecked && "row-checked"}`}>
      <td>
        <input type="checkbox" name={email}checked={userRecord?.isChecked || false} onChange={(e) =>handleChecked(e)} />
      </td>
      <td>{name}</td>
      <td>{email}</td>
      <td>{role}</td>
      <td>
        <a href="#updataingForm">
          <svg className="row__icon" onClick={selectUserData}>
            <use xlinkHref={`${Icons}#icon-edit`}/>
          </svg>
        </a>
        <svg className="row__icon row__icon--delete" onClick={deleteUserDetail}>
          <use xlinkHref={`${Icons}#icon-bin2`} />
        </svg>
      </td>
    </tr>
  );
}

export default UserDetail;
