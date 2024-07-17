import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth } from '../config/firebase';

export const registerUser = async (email, password, username) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(userCredential.user, { displayName: username });
    console.log('User registered successfully:', userCredential.user);
  } catch (error) {
    console.error('Error registering user:', error);
    throw error;
  }
};
