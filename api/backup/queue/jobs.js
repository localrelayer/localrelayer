import kue from 'kue';

const jobs = kue.createQueue();

export default jobs;
