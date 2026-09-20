import React from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../pages/Login.css";

export default function Login() {
  const navigate=useNavigate()
  const [formData,setformData]=useState({
    name:'',date:"",email:"",password:""
  })
  async function subHandler(e){
    e.preventDefault()
    try{
     const res=await axios.post(`${import.meta.env.VITE_API_URL || "http://localhost:8800"}/pulseConnect-register`,formData,{withCredentials:true})
      if(res.data.success){
        return navigate('/complete-profile')
      }
      else return alert("Something Went Wrong")
    }
    catch(err){
      console.log("Something went wrong",err.message);
               
    }


  }
  return (
    <div className="main-container">
      <div className="form-card">
        <div className="form-header">
          <h1>🩸 Join PulseConnect</h1>
          <p>Become a donor. Save a life today.</p>
        </div>

        <form className="register-form"  onSubmit={subHandler}>
          <div className="input-group">
            <input type="text" required onChange={(e)=>{setformData({...formData,name:e.target.value})}}/>
            <label>Name</label>
          </div>

          <div className="input-group">
            <input type="date" required onChange={(e)=>{setformData({...formData,date:e.target.value})}}/>
            <label>Date of Birth</label>
          </div>

          <div className="input-group">
            <input type="email" required onChange={(e)=>{setformData({...formData,email:e.target.value})}}/>
            <label>Email</label>
          </div>

          <div className="input-group">
            <input type="password" required onChange={(e)=>{setformData({...formData,password:e.target.value})}} />
            <label>Password</label>
          </div>

          <button className="register-btn">Create Account</button>
        </form>
      </div>
    </div>
  );
}
