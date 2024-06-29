const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const Users = require('./User');
const Course = require('./Course');

exports.signup = async (req, res) => {
  const { username, password, email, mobile, role } = req.body;

  if (!username || !password || !email || !mobile || !role) {
    return res.status(400).send({ message: 'All fields are required.' });
  }

  if (username.length < 3) {
    return res.status(400).send({ message: 'Username must be at least 3 characters long.' });
  }

  if (!/^[a-zA-Z]+$/.test(username)) {
    return res.status(400).send({ message: 'Username can only contain alphabetic characters.' });
  }

  if (!/\S+@\S+\.\S+/.test(email)) {
    return res.status(400).send({ message: 'Invalid email format.' });
  }

  if (!/(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*\W)/.test(password)) {
    return res.status(400).send({ message: 'Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character.' });
  }

  if (mobile.length !== 10 || !/^\d+$/.test(mobile)) {
    return res.status(400).send({ message: 'Mobile number must be a 10-digit numeric value.' });
  }

  try {
    const user = await Users.create({ username, password, email, mobile, role });
    res.send({ message: 'User registered successfully.' });
  } catch (error) {
    console.error('Error signing up:', error);
    res.status(500).send({ message: 'Server error' });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).send({ message: 'Email and password are required.' });
  }

  try {
    const user = await Users.findOne({ email });
    if (!user) {
      return res.status(404).send({ message: 'User not found.' });
    }
    if (user.password !== password) {
      return res.status(401).send({ message: 'Password incorrect.' });
    }
    const tokenPayload = {
      userId: user._id,
      // username: user.username, 
      // role: user.role 
    };
    const token = jwt.sign(tokenPayload, 'SECRET_KEY', { expiresIn: '24h' });
    res.send({ message: 'Login successful.', token, userId: user._id });
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).send({ message: 'Server error' });
  }
};

exports.getUserById = async (req, res) => {
  const userId = req.params.userId;
  const usertokenId = req.user.userId;
  if (userId !== usertokenId) {
    return res.status(401).json({ message: 'Unauthorized user' });
  }
  
  try {
    const user = await Users.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ user });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.editProfile = async (req, res) => {
  const userId = req.params.userId;
  const usertokenId = req.user.userId;
  const { username, mobile, email, password } = req.body;

  // Validation checks
  if (!username || !mobile || !email || !password) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

  if (username.length < 3) {
    return res.status(400).json({ message: 'Username must be at least 3 characters long.' });
  }

  if (!/^[a-zA-Z]+$/.test(username)) {
    return res.status(400).json({ message: 'Username can only contain alphabetic characters.' });
  }

  if (!/\S+@\S+\.\S+/.test(email)) {
    return res.status(400).json({ message: 'Invalid email format.' });
  }

  if (!/(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*\W)/.test(password)) {
    return res.status(400).json({ message: 'Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character.' });
  }

  if (mobile.length !== 10 || !/^\d+$/.test(mobile)) {
    return res.status(400).json({ message: 'Mobile number must be a 10-digit numeric value.' });
  }

  if (userId !== usertokenId) {
    return res.status(401).json({ message: 'Unauthorized user' });
  }

  try {
    // Check if the email already exists for another user
    const existingUserWithEmail = await Users.findOne({ email });
    if (existingUserWithEmail && existingUserWithEmail._id.toString() !== userId) {
      return res.status(400).json({ message: 'Email is already in use by another user.' });
    }

    const updatedUser = await Users.findByIdAndUpdate(userId, { username, mobile, email, password }, { new: true });
    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ message: 'Profile updated successfully', user: updatedUser });
  } catch (error) {
    console.error('Error editing profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
};



exports.getAllCourses = async (req, res) => {
  try {
    const courses = await Course.find();
    res.json(courses);
  } catch (error) {
    console.error('Error getting all courses:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getMyCourses = async (req, res) => {
  const userId = req.user.userId;
  try {
    const user = await Users.findById(userId).populate('courses');
    res.json(user.courses);
  } catch (error) {
    console.error('Error getting user courses:', error);
    res.status(500).json({ message: 'Server error' });
  }
};


exports.getcreatedCourses = async (req, res) => {
  const userId = req.user.userId;
  try {
    const user = await Users.findById(userId).populate('createdcourse');
    res.json(user.createdcourse);
  } catch (error) {
    console.error('Error getting user courses:', error);
    res.status(500).json({ message: 'Server error' });
  }
};


exports.enrollCourse = async (req, res) => {
  const { courseId } = req.params;
  const userId = req.user.userId;

  try {
    const user = await Users.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.courses.includes(courseId)) {
      return res.status(400).json({ message: 'You are already enrolled in this course.' });
    }
    user.courses.push(courseId);
    await user.save();

    res.json({ message: 'Course enrolled successfully.' });
  } catch (error) {
    console.error('Error enrolling course:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getCourseContent = async (req, res) => {
  const { courseId } = req.params;
  try {
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    res.json(course.lectures);
  } catch (error) {
    console.error('Error getting course content:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getSingleCourse = async (req, res) => {
  const { courseId } = req.params;
  try {
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    res.json(course);
  } catch (error) {
    console.error('Error getting course content:', error);
    res.status(500).json({ message: 'Server error' });
  }
};


exports.addCourse = async (req, res) => {
  const { title, description, price, mentor, image, lectures } = req.body;
  const userId = req.user.userId;
  if (!title || !description || !price || !mentor || !image || !lectures) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

  try {
    const course = await Course.create({ title, description, price, mentor, image, lectures });
    const user = await Users.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if(user.role!=='admin'){
      return res.status(404).json({ message: 'Not Admin' });
    }

    user.createdcourse.push(course._id);
    await user.save();

    res.send({ message: 'Course added successfully.', course });
  } 
  catch (error) {
    console.error('Error adding course:', error);
    res.status(500).send({ message: 'Server error' });
  }
};


exports.saveFeedback = async (req, res) => {
  const { courseId } = req.params;
  const { rating, feedback } = req.body;
  const userId = req.user.userId;
  if (!feedback || feedback.length < 5) {
    return res.status(400).json({ message: 'Feedback must not be empty and must contain at least 5 characters.' });
  }

  try {
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    const existingFeedbackIndex = course.feedbacks.findIndex(fb => fb.user.toString() === userId);
    const currentDate = new Date();
    if (existingFeedbackIndex !== -1) {
      course.feedbacks[existingFeedbackIndex].rating = rating;
      course.feedbacks[existingFeedbackIndex].feedback = feedback;
      course.feedbacks[existingFeedbackIndex].createdAt = currentDate;
    } else {
      course.feedbacks.push({
        user: userId,
        rating,
        feedback
      });
    }

    await course.save();

    res.json({ message: 'Feedback saved successfully', course });
  } catch (error) {
    console.error('Error saving feedback:', error);
    res.status(500).json({ message: 'Server error' });
  }
};



exports.showFeedback = async (req, res) => {
  try {
    const courseId = req.params.courseId;
    const course = await Course.findById(courseId).populate('feedbacks.user');
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    const feedbacks = course.feedbacks;
    res.json({ feedbacks });
  } catch (error) {
    console.error('Error fetching ratings and comments:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};




exports.getCreatedcourseById = async (req, res) => {
  const { courseId } = req.params;
  const userId = req.user.userId; 
  try {
    const course = await Course.findById(courseId);

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    const user = await Users.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const userCreatedCourseIds = user.createdcourse.map(course => course.toString());
    if (!userCreatedCourseIds.includes(courseId)) {
      return res.status(403).json({ message: 'You are not authorized to access this course' });
    }

    res.json({ course });
  } catch (error) {
    console.error('Error fetching course:', error);
    res.status(500).json({ message: 'Server error' });
  }
};


exports.editCourse = async (req, res) => {
  const { courseId } = req.params; 

  const { title, description, price, mentor, image, lectures } = req.body;
  const userId = req.user.userId; 

  if (!title || !description || !price || !mentor || !image || !lectures) {
    return res.status(400).json({ message: 'All fields are required.' });
  }
  
  try {
    const course = await Course.findById(courseId);
    
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    const user = await Users.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    const userCreatedCourse = user.createdcourse.map(course => course.toString());
    if (!userCreatedCourse.includes(courseId)) {
      return res.status(403).json({ message: 'You are not authorized to edit this course' });
    }
    const updatedCourse = await Course.findByIdAndUpdate(courseId, { title, description, price, mentor, image, lectures }, { new: true });

    res.send({ message: 'Course updated successfully.', course: updatedCourse });
  } 
  
  catch (error) {
    console.error('Error updating course:', error);
    res.status(500).send({ message: 'Server error' });
  }
};

exports.deleteCourse=async (req, res) => {
  try {
    const courseId = req.params.courseId;
    const userId = req.user.userId;
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    const user = await Users.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    if(user.role!=='admin'){
      return res.status(404).json({ message: 'Not Admin' });
    }

    await Course.findByIdAndDelete(courseId);
    res.json({ message: 'Course deleted successfully' });
  } 
  catch (error) {
    console.error('Error deleting course:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

