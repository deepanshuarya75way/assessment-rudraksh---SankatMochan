import express from 'express';
import auth from '../middleware/auth.js';
import{list,markAllRead,markRead} from '../controllers/notificationController.js';
