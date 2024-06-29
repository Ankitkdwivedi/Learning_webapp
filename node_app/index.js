const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const path = require('path');
require('dotenv').config()
const userController = require('./controllers/userController');
const authMiddleware = require('./middleware/authMiddleware');
// const seed = require("./seed")
const multer = require('multer');
// const PdfDetail = require('./controllers/PdfDetail');
const { v4: uuidv4 } = require('uuid');

const app = express();
const port = 5000;

app.use("/files", express.static("files"));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname,'react_app/build/static')))

app.get('*',(req,res)=>{
  res.sendFile(path.join(__dirname,'react_app/build/index.html'));
})
// seed()

mongoose.connect(process.env.db_url, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  })
  .catch(err => console.error('Error connecting to MongoDB:', err));
 


// Routes
app.post('/signup', userController.signup);
app.post('/login', userController.login);
app.get('/user/:userId', authMiddleware.verifyToken, userController.getUserById);
app.put('/user/:userId', authMiddleware.verifyToken, userController.editProfile);

app.post('/add-course',authMiddleware.verifyToken, userController.addCourse);
app.get('/courses', userController.getAllCourses);
app.post('/enroll-course/:courseId', authMiddleware.verifyToken, userController.enrollCourse);
app.get('/my-courses', authMiddleware.verifyToken, userController.getMyCourses);
app.get('/created-courses', authMiddleware.verifyToken, userController.getcreatedCourses);

app.get('/my-courses/:courseId', userController.getCourseContent);
app.get('/single-course/:courseId', userController.getSingleCourse);

app.get('/courses/:courseId/feedback',userController.showFeedback);
app.post('/my-courses/:courseId/feedback', authMiddleware.verifyToken, userController.saveFeedback);


app.get('/edit-course/:courseId', authMiddleware.verifyToken, userController.getCreatedcourseById);

app.put('/edit-course/:courseId', authMiddleware.verifyToken, userController.editCourse);

app.delete('/delete-course/:courseId',authMiddleware.verifyToken, userController.deleteCourse);

