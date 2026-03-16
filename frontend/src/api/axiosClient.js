import axios from "axios";

const axiosClient = axios.create({
  // baseURL: "https://backendbyteblog-production.up.railway.app/",// backend base URL
  baseURL: "http://localhost:8080/", 
  headers: {
    "Content-Type": "application/json",
  },
});


axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("username");
      window.location.href = "/login"; 
    }

    return Promise.reject(error);
  }
);

export const checkLoginState = async () => {
  const response = await axiosClient.get("/auth/me");
  return response.data;
}

export const getSolvedQuestion = async (username) => {
  const response = await axiosClient.get(`/questions/get/${username}`);
  return response.data;
}




export const searchUsers = async (query) => {
  const response = await axiosClient.get(
    `/search/users/get`,
    { params: { query } }
  );
  return response.data;
};

export const getUserProfile = async (username) => {
  const res = await axiosClient.get(`/search/users/profile`, {params: { username }});
  return res.data;
}

export const friendRequest = async (senderUsername, receiverUsername) => {
  const res = await axiosClient.post(
    "/friends/request/create",
    null,
    { params: { senderUsername, receiverUsername } }
  );
  return res.data;
};

export const friendRequestAccepted = async (senderUsername, receiverUsername) => {
  const res = await axiosClient.post(
    "/friends/request/accept",
    null,
    { params: { senderUsername, receiverUsername } }
  );
  return res.data;
};

export const friendRequestRejected = async (senderUsername, receiverUsername) => {
  const res = await axiosClient.post(
    "/friends/request/reject",
    null,
    { params: { senderUsername, receiverUsername } }
  );
  return res.data;
};

export const friendRequestCheck = async (senderUsername, receiverUsername) => {
  const res = await axiosClient.get(
    "/friends/request/check",
    { params: { senderUsername, receiverUsername } }
  );
  if(res.data == "None") res.data = null;
  return res.data; // PENDING | ACCEPTED | REJECTED
};

export const getIncomingFriendRequests = async () => {
  const res = await axiosClient.get("/friends/requests/incoming");
  return res.data;   // array
};

export const acceptFriendRequest = async (requestId) => {
  const res = await axiosClient.post(`/friends/request/${requestId}/accept`);
  return res.data;
};

export const rejectFriendRequest = async (requestId) => {
  const res = await axiosClient.post(`/friends/request/${requestId}/reject`);
  return res.data;
};

//using this in friendPage
export const getFriendUser = async (username) => {
  const res = await axiosClient.get(`/friends/get/user/${username}`);
  return res.data; 
};

export const getSentFriendRequests = async () => {
  const res = await axiosClient.get("/friends/requests/sent");
  return res.data;
};

export const withdrawFriendRequest = async (requestId) => {
  const res = await axiosClient.delete(`/friends/request/${requestId}/withdraw`);
  return res.data;
};

export const getAcceptedFriends = async() => {
  const res = await axiosClient.get("/friends/accepted");
  return res.data;
}

export const removeFriend = async() => {
  const res = await axiosClient.get("/friends/accepted");
  return res.data;
}



export default axiosClient;