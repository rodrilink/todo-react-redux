import firebase from 'firebase/app';
import { Subject } from 'rxjs';

import 'firebase/auth';
import 'firebase/database';

import { firebaseConfig } from './config';

export let db = [];

export let consec = 1;

export const firebaseApp = firebase.initializeApp(firebaseConfig);
export const firebaseAuth = firebase.auth();
export const firebaseDb = firebase.database();
export const firebaseDbFake = new Subject();