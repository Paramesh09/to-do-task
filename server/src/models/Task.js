import mongoose from 'mongoose';

export const PRIORITIES = ['low', 'medium', 'high'];
export const STATUSES = ['in_progress', 'completed'];

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [120, 'Title should be under 120 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, 'Description should be under 1000 characters'],
      default: '',
    },
    dueAt: {
      type: Date,
      required: [true, 'Date & time is required'],
    },
    priority: {
      type: String,
      enum: { values: [...PRIORITIES, null], message: 'Priority must be low, medium or high' },
      default: null,
    },
    status: {
      type: String,
      enum: { values: STATUSES, message: 'Status must be in_progress or completed' },
      default: 'in_progress',
    },
    completedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: {
      versionKey: false,
      transform(_doc, ret) {
        ret.id = ret._id.toString();
        delete ret._id;
        return ret;
      },
    },
  }
);

taskSchema.index({ dueAt: 1 });

taskSchema.pre('save', function () {
  if (this.isModified('status')) {
    this.completedAt = this.status === 'completed' ? new Date() : null;
  }
});

export const Task = mongoose.model('Task', taskSchema);
