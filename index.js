const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const port = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());

let ADMINS = [];
let USERS = [];
let COURSES = [];

const adminAuthentication = (req, res, next) => {
  const { username, password } = req.headers;
  console.log("control here");
  console.log(username);
  console.log(password);
  const admin = ADMINS.find(
    (a) => a.username === username && a.password === password
  );
  if (admin) {
    next();
  } else {
    res.status(403).json({ messege: "Auth failed" });
  }
};

const userAuthentication = (req, res, next) => {
  const { username, password } = req.headers;
  const user = USERS.find(
    (u) => u.username === username && u.password === password
  );
  if (user) {
    req.user = user; // Add user object to the request...
    next();
  } else {
    res.status(404).json({ messege: "User authentication failed!" });
  }
};

// admin routes
app.post("/admin/signup", (req, res) => {
  // logic to signup admin
  const admin = req.body; // admin = { username: ayan@gmail.com, pass: 1234 }
  const existingAdmin = ADMINS.find((a) => a.username === admin.username);
  if (existingAdmin) {
    res.status(403).json({ messege: "Admin already exists" });
  } else {
    ADMINS.push(admin);
    const token = generateJwt(admin);
    res.json({ messege: "Admin created successfully" }, token);
  }
});

app.post("/admin/login", adminAuthentication, (req, res) => {
  res.json({ messege: "Admin logged in sucessfully" });
});

app.get("/admin/courses", adminAuthentication, (req, res) => {
  const course = req.body;
  if (!course.title) {
    return res.status(411).send("Please provide course title");
  }
  course.id = Date.now();
  COURSES.push(course);
  res.json({ messege: "Course created successfully", courseId: course.id });
});

app.put("/admin/courses/:courseId", adminAuthentication, (req, res) => {
  const courseId = parseInt(req.params.courseId);
  const course = COURSES.find((c) => c.id === courseId);
  if (course) {
    Object.assign(course, req.body);
    res.json({ messege: "Course updated successfully!" });
  } else {
    res.status(404).json({ messege: "Course not found!" });
  }
});

app.get("/admin/courses", adminAuthentication, (req, res) => {
  res.json({ courses: COURSES });
});

// user routes
app.post("/users/signup", (req, res) => {
  const user = { ...req.body, purchasedCourse: [] };
  // const user = {
  //     username: req.body.username,
  //     password: req.body.password,
  //     purchasedCourse: []
  // };
  USERS.push(user);
  res.json({ messege: "User created successfully" });
});

app.post("/users/login", userAuthentication, (req, res) => {
  res.json({ messege: "User signed in successfully" });
});

app.get("/users/courses", userAuthentication, (req, res) => {
  // let filteredCourses = [];
  // for(let i = 0; i<COURSES.lenght; i++) {
  //     if(COURSES[i].published) {
  //         filteredCourses.push(COURSES[i]);
  //     }
  // }
  res.json({ courses: COURSES.filter((c) => c.published) });
});

app.post("/users/courses/:courseId", userAuthentication, (req, res) => {
  const courseId = parseInt(req.params.courseId);
  const course = COURSES.find((c) => c.courseId && c.published);
  if (course) {
    // find the user in global USERS array...
    req.user.purchasedCourse.push(courseId);
    res.json({ messege: "Course purchased successfully" });
  } else {
    res.status(404).json({ messege: "Course not found or not available" });
  }
});

app.get("/users/purchasedcourses", userAuthentication, (req, res) => {
  const purchasedCourse = COURSES.filter((c) =>
    req.user.purchasedCourse.includes(c.id)
  );
  res.json({ purchasedCourse });
});

app.listen(port, () => {
  console.log(`app listening on port ${port}`);
});