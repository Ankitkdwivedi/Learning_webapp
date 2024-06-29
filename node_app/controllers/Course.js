const mongoose = require('mongoose');

const lectureSchema = new mongoose.Schema({
  title: { type: String, trim: true, required: true },
  video: { type: String, trim: true, required: true },
  notes: { type: String, trim: true },
  assignment : { type: String, trim: true }
}, { timestamps: true});

const feedbackSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, 
  rating: { type: Number, required: true, min: 0, max: 5 },
  feedback: { type: String, trim: true },
  createdAt: { type: Date, default: Date.now } 
});

// const assignmentSchema = new mongoose.Schema({
//   name: { type: String, trim: true, required: true },
//   pdf: {
//     data: Buffer,
//     contentType: String
//   }
// }, { timestamps: true });



const courseSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true, trim: true },
  price: { type: Number, min: 0 },
  mentor: { type: String, required: true, trim: true },
  image: { type: String, trim: true, default: 'photo.jpg' },
  ratings: [{ type: Number, min: 0, max: 5 }],
  feedbacks: [feedbackSchema],
  lectures: [lectureSchema],
}, {
  timestamps: true 
}
);

const Course = mongoose.model('Course', courseSchema);

module.exports = Course;
