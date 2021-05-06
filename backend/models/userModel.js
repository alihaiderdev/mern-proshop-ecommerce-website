import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    isAdmin: {
      type: Boolean,
      required: true,
      default: false,
    },
  },
  //   created at updated at time mongoose handled by itself timestamps: true
  { timestamps: true }
);

// method for checking user input passwords matching or not
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password); // here this.password is the encrypted password stored in database
};

// its a middleware that we use for hashing user password before saving to the database
// before saving document to database
userSchema.pre('save', async function (next) {
  // checking password is modifying or not by user when updating profile
  if (!this.isModified('password')) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  // password hashing before document saving to DB
  this.password = await bcrypt.hash(this.password, salt);
});

const User = mongoose.model('User', userSchema);

export default User;
