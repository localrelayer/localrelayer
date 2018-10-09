import kue from 'kue';

const jobs = kue.createQueue();

jobs.create(
  'testQueue',
  {
    id: 1,
  }
).save();

jobs.create(
  'testQueue',
  {
    id: 2,
  }
).save();


jobs.process('testQueue', 1, (job, done) => {
  console.log('-------');
  console.log(job.type);
  console.log(job.data);
  console.log('-------');
  done();
});
