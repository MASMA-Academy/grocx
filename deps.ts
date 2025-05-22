import express from "npm:express@4.18.2";
import pg from "npm:pg@8.11.3";
import cors from "npm:cors@2.8.5";
import jwt from "npm:jsonwebtoken@9.0.2";
import bcrypt from "npm:bcrypt@5.1.1";
import dotenv from "npm:dotenv@16.3.1";
import { config as loadEnv } from "https://deno.land/x/dotenv@v3.2.2/mod.ts";

const { Pool } = pg;

export { bcrypt, cors, dotenv, express, jwt, loadEnv, Pool };

export type Request = express.Request;
export type Response = express.Response;
export type NextFunction = express.NextFunction;

// Add user to express Request
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: number;
        isAdmin: boolean;
      };
    }
  }
}