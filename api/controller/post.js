import * as dotenv from "dotenv";
dotenv.config();
import { db } from "../connect.js";
import jwt from "jsonwebtoken";
import moment from "moment";

export const getPosts = (req, res) => {
  const token = req.cookies.accessToken;

  if (!token) return res.status(401).json("Not logged in!");

  jwt.verify(token, process.env.MY_SECRET, (err, userInfo) => {
    if (err) return res.status(403).json("Token is not valid!");

    const query = `SELECT p.*, u.id AS userId, name, profilePic 
    FROM posts AS p JOIN users AS u ON (u.id = p.userId)
    LEFT JOIN relationships AS r ON (p.userId = r.followedUserId)
    WHERE r.followerUserId = ? OR p.userId = ?
    ORDER BY p.createAt DESC`;

    db.query(query, [userInfo.id, userInfo.id], (err, data) => {
      if (err) return res.status(500).json(err);
      return res.status(200).json(data);
    });
  });
};
export const addPost = (req, res) => {
  const token = req.cookies.accessToken;

  if (!token) return res.status(401).json("Not logged in!");

  jwt.verify(token, process.env.MY_SECRET, (err, userInfo) => {
    if (err) return res.status(403).json("Token is not valid!");

    const query = "INSERT INTO posts (`desc`, `img`, `createAt`, `userId`) VALUES (?)";
    const values = [
      req.body.desc,
      req.body.img,
      moment(Date.now()).format("YYYY-MM-DD HH:mm:ss"),
      userInfo.id,
    ];

    db.query(query, [values], (err, data) => {
      if (err) return res.status(500).json(err);
      return res.status(200).json("Post has been created.");
    });
  });
};
