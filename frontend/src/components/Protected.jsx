import React from "react";
import { useState,useEffect } from "react";
import axios from "axios";
import { Navigate } from "react-router-dom";
export default function Protected({children}){
    const [auth,setAuth]=useState(null)
    useEffect(()=>{
axios.get(`${import.meta.env.VITE_API_URL || "http://localhost:8800"}/verify-user`,{withCredentials:true})
.then(()=>setAuth(true))
.catch(()=>setAuth(false))
    },[])
   if(auth==null)return <p>Loading....</p>
return auth?children:<Navigate to="/login"/>
}