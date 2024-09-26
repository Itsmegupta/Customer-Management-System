import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Avatar, Typography, Skeleton } from "@mui/material";
import { v4 as uuidv4 } from "uuid";
import io from "socket.io-client";
import Picker from "emoji-picker-react";
import { BsEmojiSmileFill } from "react-icons/bs";
import { IoMdSend } from "react-icons/io";
import { sendMessageRoute, recieveMessageRoute } from "../utils/APIRoutes";

const Chat = () => {
  const [chatList, setChatList] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newMessage, setNewMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [isLoadingMessages, setIsLoadingMessages] = useState(true);
  const [CurruntUserDetails, setCurruntUserDetails] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [msg, setMsg] = useState("");
  const emojiPickerRef = useRef(null);
  const scrollRef = useRef();
  const [isTyping, setIsTyping] = useState(false);
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  const typingTimeoutRef = useRef(null);
  const token = localStorage.getItem("token");
  const socket = io("http://localhost:3939");

  useEffect(() => {
    const storedUserDetails = localStorage.getItem("UserDetails");
    if (storedUserDetails) {
      setCurruntUserDetails(JSON.parse(storedUserDetails));
    }
  }, []);

  // useEffect(() => {
  //   if (CurruntUserDetails) {
  //     console.log(CurruntUserDetails._id, "CurruntUserDetails");

  //     const socket = io("http://localhost:3939", {
  //       query: { userId: CurruntUserDetails._id },
  //     });

  //     // Cleanup socket connection on unmount
  //     return () => {
  //       socket.disconnect();
  //     };
  //   }
  // }, [CurruntUserDetails]);

  const handleEmojiPickerhideShow = () => {
    setShowEmojiPicker(!showEmojiPicker);
  };

  useEffect(() => {
    socket.on("user-typing", (data) => {
      // console.log(data,selectedChat._id);
      if (selectedChat && data.from === selectedChat._id) {
        setOtherUserTyping(true);
        setTimeout(() => setOtherUserTyping(false), 10000); // Hide typing status after 3 seconds
      }
    });
    return () => {
      socket.off("user-typing");
    };
  }, [selectedChat]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    socket.on("rec-message", (message) => {
      if (selectedChat && message.from === selectedChat._id) {
        setMessages((prevMessages) => [...prevMessages, message]);
      }
    });

    return () => {
      socket.off("rec-message");
    };
  }, [selectedChat]);

  useEffect(() => {
    socket.on("user-online", (userId) => {
      setChatList((prevChats) =>
        prevChats.map((chat) =>
          chat._id === userId ? { ...chat, isOnline: true } : chat
        )
      );
    });

    socket.on("user-offline", (userId) => {
      setChatList((prevChats) =>
        prevChats.map((chat) =>
          chat._id === userId ? { ...chat, isOnline: false } : chat
        )
      );
    });
    return () => {
      socket.off("user-online");
      socket.off("user-offline");
    };
  }, []);

  useEffect(() => {
    const crrUser = JSON.parse(localStorage.getItem("UserDetails"));
    setTimeout(() => {
      axios
        .get(`http://localhost:3939/chat-users/${crrUser._id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .then((response) => {
          setChatList(response.data);
          setLoading(false);
        })
        .catch((err) => {
          console.error("Error fetching chat list:", err);
          setError("Failed to load chat list.");
          setLoading(false);
        });
    }, 200);
  }, [token]);

  useEffect(() => {
    if (selectedChat) {
      setIsLoadingMessages(true);
      setTimeout(() => {
        setIsLoadingMessages(false);
      }, 1000);
    }
  }, [selectedChat]);

  const handleClickOnUserList = async (row) => {
    setSelectedChat(row);

    setIsLoadingMessages(true);

    try {
      const response = await axios.post(
        recieveMessageRoute,
        {
          from: CurruntUserDetails._id,
          to: row._id,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setMessages(response.data);
    } catch (err) {
      console.error("Error loading chat messages:", err);
    } finally {
      setIsLoadingMessages(false);
    }
  };

  const sendChat = async (event) => {
    event.preventDefault();

    if (msg.length > 0) {
      const messageData = {
        from: CurruntUserDetails._id,
        to: selectedChat._id,
        message: msg,
      };

      socket.emit("message", messageData);

      try {
        await axios.post(
          sendMessageRoute,
          {
            from: CurruntUserDetails._id,
            to: selectedChat._id,
            message: msg,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const response = await axios.post(
          recieveMessageRoute,
          {
            from: CurruntUserDetails._id,
            to: selectedChat._id,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setMessages(response.data);
        setMsg("");
      } catch (error) {
        console.error("Error sending message:", error);
      }
    }
  };

  const handleEmojiClick = (emojiObject) => {
    setMsg((prevMsg) => prevMsg + emojiObject.emoji);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        emojiPickerRef.current &&
        !emojiPickerRef.current.contains(event.target)
      ) {
        setShowEmojiPicker(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [emojiPickerRef]);

  const handleInputChange = (e) => {
    setMsg(e.target.value);

    if (!isTyping) {
      setIsTyping(true);
      socket.emit("typing", {
        from: CurruntUserDetails._id,
        to: selectedChat._id,
      });

      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        setIsTyping(false);
      }, 1000);
    }
  };

  return (
    <div className="chatPageStyle">
      <div className="chatContainer">
        <div className="iFNuCj">
          <div className="brand">
            <img src="meetme.png" alt="logo" />
            <h4>QuickChat</h4>
          </div>
          <div className="contacts">
            {chatList.map((row) => (
              <div
                key={row._id}
                className="contact"
                onClick={() => handleClickOnUserList(row)}
                style={{
                  backgroundColor:
                    selectedChat?._id === row._id
                      ? "rgb(154, 134, 243)"
                      : "#dee2e6",
                  border: "1px solid #bdbdbd",
                }}
              >
                <div className="avatar">
                  <Avatar
                    alt={row.name}
                    src={
                      row.imageUrl
                        ? `${row.imageUrl}?t=${new Date().getTime()}`
                        : `http://localhost:3939/${
                            row.image
                          }?t=${new Date().getTime()}`
                    }
                    sx={{ width: "2.5rem", height: "2.5rem" }}
                  />
                  {row.isOnline && (
                    <span
                      style={{
                        backgroundColor: "green",
                        borderRadius: "50%",
                        width: "10px",
                        height: "10px",
                        display: "inline-block",
                        position: "absolute",
                        bottom: 0,
                        right: 0,
                      }}
                    />
                  )}
                </div>
                <div className="username">
                  <h5>{row.name}</h5>
                </div>
              </div>
            ))}
          </div>
          {CurruntUserDetails && (
            <div className="current-user">
              <div className="avatar">
                <Avatar
                  alt={CurruntUserDetails.name}
                  src={
                    CurruntUserDetails.imageUrl
                      ? `${
                          CurruntUserDetails.imageUrl
                        }?t=${new Date().getTime()}`
                      : `http://localhost:3939/${
                          CurruntUserDetails.image
                        }?t=${new Date().getTime()}`
                  }
                  sx={{
                    width: "2.5rem",
                    height: "2.5rem",
                    marginLeft: "1rem",
                  }}
                />
              </div>
              <div className="username">
                <h5>{CurruntUserDetails.name}</h5>
              </div>
            </div>
          )}
        </div>
        {selectedChat ? (
          <div className="sc-fqkvVR dxRFpG">
            <div className="chat-header">
              <div className="user-details">
                <div className="avatar">
                  <Avatar
                    alt={selectedChat.name}
                    src={
                      selectedChat.imageUrl
                        ? `${selectedChat.imageUrl}?t=${new Date().getTime()}`
                        : `http://localhost:3939/${
                            selectedChat.image
                          }?t=${new Date().getTime()}`
                    }
                    sx={{ width: "2.8rem", height: "2.8rem" }}
                  />
                </div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    textAlign: "center",
                    height: "100%",
                  }}
                >
                  <Typography variant="h6">{selectedChat.name}</Typography>
                  {otherUserTyping && (
                    <p style={{ fontStyle: "italic" }}>typing...</p>
                  )}
                </div>
              </div>
            </div>

            {isLoadingMessages ? (
              <div>
                <Skeleton variant="rectangular" height={80} />
                <Skeleton variant="text" />
                <Skeleton variant="text" />
              </div>
            ) : (
              <div className="chat-messages">
                {messages.map((message) => (
                  <div ref={scrollRef} key={uuidv4()}>
                    <div
                      className={`message ${
                        message.fromSelf ? "sended" : "recieved"
                      }`}
                    >
                      <div className="content">
                        <p>{message.message}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="sc-gEvEer cqJzVL">
              <div className="button-container">
                <div className="emoji" ref={emojiPickerRef}>
                  <BsEmojiSmileFill onClick={handleEmojiPickerhideShow} />
                  {showEmojiPicker && (
                    <div style={{ position: "absolute", bottom: "60px" }}>
                      <Picker onEmojiClick={handleEmojiClick} />
                    </div>
                  )}
                </div>
              </div>
              <form
                className="input-container"
                onSubmit={(event) => sendChat(event)}
              >
                <input
                  type="text"
                  placeholder="type your message here"
                  onChange={handleInputChange}
                  value={msg}
                />
                <button type="submit">
                  <IoMdSend />
                </button>
              </form>
            </div>
          </div>
        ) : (
          <div className="RqvyP">
            <img src="hi-hey.gif" alt="sss"></img>
            <h2>
              Welcome, <span>{CurruntUserDetails?.username}</span>
            </h2>
            <h5>Please select a chat to Start messaging.</h5>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;
