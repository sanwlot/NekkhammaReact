import { Link } from "react-router-dom";
import "./Forum.css";
import { collection, deleteDoc, doc, getDocs } from "firebase/firestore";
import { useEffect, useState } from "react";
import { db } from "../firebase";
import { Spinner } from "../components/Spinner";

export default function Forum({ isUserLoggedIn, currentUserId }) {
  const [posts, setPosts] = useState([]);

  useEffect(getPosts, []);

  function getPosts() {
    console.log("Forum component is mounted and state is empty", posts);
    // Whatver we do here, is done after the component is rendered
    getDocs(collection(db, "posts")).then((querySnapshot) => {
      console.log("Firestore DB returned data:", querySnapshot.docs);
      const formatted = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      console.log(
        "Formatted data that a normal person can understand:",
        formatted
      );
      setPosts(formatted);
    });
  }

  async function handleDelete(e, id) {
    e.preventDefault();
    const postRef = doc(db, "posts", id);
    try {
      await deleteDoc(postRef);
      getPosts();
    } catch (error) {
      alert(error.message);
    }
  }

  if (posts.length === 0) return <Spinner />;

  return (
    <div className="forumContainer container">
      {isUserLoggedIn && (
        <Link to="/newPost">
          <button className="startADiscussionButton">Start a discussion</button>
        </Link>
      )}
      {!isUserLoggedIn && (
        <p style={{ marginLeft: "25px", color: "#6c4d38" }}>
          You need to be signed in to start a discussion.
        </p>
      )}
      <ul className="threadContainer">
        {posts.map((post) => (
          <Link to={`${post.id}`} key={post.id}>
            <li className="thread">
              <div>{post.title}</div>
              <div style={{ display: "flex", gap: "20px" }}>
                <div>{post.author}</div>
                <div>
                  <span style={{ marginRight: "15px" }}>
                    {new Date(post.createdAt).toLocaleDateString("en")}
                  </span>
                  <span>
                    {new Date(post.createdAt).toLocaleString("en", {
                      hour: "numeric",
                      minute: "numeric",
                    })}
                  </span>
                </div>
                {isUserLoggedIn && post.userId === currentUserId && (
                  <button
                    className="btn btn-outline-danger"
                    onClick={(e) => handleDelete(e, post.id)}
                  >
                    Delete
                  </button>
                )}
              </div>
            </li>
          </Link>
        ))}
      </ul>
    </div>
  );
}
