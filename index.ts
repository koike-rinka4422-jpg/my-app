import "dotenv/config";
import express from "express";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "./generated/prisma/client";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter, log: ["query"] });

const app = express();
const PORT = process.env.PORT || 8888;

// 画面を表示するための設定じゃ
app.set("view engine", "ejs");
app.set("views", "./views");
app.use(express.urlencoded({ extended: true }));

// ユーザー一覧画面を表示する（年齢も一緒に取得するぞ）
app.get("/", async (req, res) => {
  const users = await prisma.user.findMany();
  res.render("index", { users });
});

// ユーザー追加ボタンが押されたときの処理
app.post("/users", async (req, res) => {
  const name = req.body.name;
  const age = Number(req.body.age); // フォームから来た文字列を数字に変えるのじゃ
  
  if (name) {
    await prisma.user.create({ 
      data: { 
        name, 
        age: isNaN(age) ? null : age // 数字じゃなければ空っぽ（null）にするぞ
      } 
    });
  }
  res.redirect("/");
});

// ★ここが大事！サーバーを起動して待ち受け状態にする命令じゃ★
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
