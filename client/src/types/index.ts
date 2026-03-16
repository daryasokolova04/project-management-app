import { ChangeEvent } from 'react';

export type FormControlElement = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;

export type FormControlChangeHandler = (e: ChangeEvent<FormControlElement>) => void;