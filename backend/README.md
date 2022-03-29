<div id="top"></div>


<!-- ABOUT THE PROJECT -->
# Backend

## Description

Our backend provides an API that conforms to the constraints of REST architectural style.



## Built With

This section includes the technologies, libraries and tools that we used for the development of backend. We selected the ones we consider that were critical and their absence would make our project more difficult.

### API

-   [Node.js](https://nodejs.org/en/about/)   
We decided to work with Node.js because it is reliable, it creates scalable applications and utilizes a programming language that we are very familiar with.

-   [Express.js](https://expressjs.com/)   
We decided to build our API using Express.js, as it is an excellent Node.js framework for creating REST APIs. We were partially drawn to it by the variety of tools and libraries that we could use to boost our development, testing and deployment process. 


### Database

-   [MongoDB](https://www.mongodb.com/)   
We used MongoDB as our NoSQL database framework, since  it covered all our needs and provided us with a sense of flexibility for future changes/additions. It's  simplicity was also a huge point that drew us to it, since having a smaller learning and setting up period was important for us at the time. 

-   [mongoose](https://mongoosejs.com/)   
We chose mongoose as an assisting tool for our database development, as it can be used to make certain aspects of using MongoDB a lot easier.



### Image storing

-   [Google cloud](https://cloud.google.com/storage)   
We used Google Cloud storage to store images. This was an important decision, as our application's main content is photos. Google cloud offered security, consistency and reliability at a very reasonable price. Also, the upload performance was superior to most other options, which helped boost our overall application's performance.


### Security 

-   [bcrypt](https://www.npmjs.com/package/bcrypt)   
We relied on the bcrypt library for hashing sensitive data, such us passwords. Our research showed that it was the undeniable superior solution, used by millions of projects, so we decided to include it in our project.

-   [jsonwebtoken](https://www.npmjs.com/package/jsonwebtoken)   
The way we would handle seesion authentication was a tricky decision. We reviewed different approaches and services and we concluded that, in our case, it would make more sense to have our own authentication system. Using other solutions, at the time, was costly and given that our app has pretty basic security needs, we decided to use the jsonwebtoken library.

-   [helmet](https://www.npmjs.com/package/helmet)   
We added helmet to our application since it is a great way to further secure our HTTP request exchanges. 

### Testing 

-   [Apache JMeter](https://jmeter.apache.org/)   
We used Apache JMeter to stress test our application's performance. As a tool, it is easy to set up and use and provides valuable and understandable feedback. Also, it allows us to test using files, which is a feature that was missing or was expensive at other similar tools.

### Deployment 

-   [pm2](https://pm2.keymetrics.io/)   
We utilized pm2 as our production process manager. It was the tool that was most widely used so we decided to incorporate it to our project. Also, we liked that it offered a very comprehensive and user friendly interface with graphs of our server's performance.

-   [nginx](https://www.nginx.com/)   
We used nginx as our reverse proxy. It offered an easy and secure way to set up an SSL reverse-proxy server to secure our backend and utilize HTTPS requests.



<p align="right">(<a href="#top">back to top</a>)</p>

## Challenges
Some challenges that we faced and the ways we solved them:

---

:question: While testing the backend, we found a memory leak when uploading photo polls.

:heavy_check_mark: Our uploading process followed these steps: 
1. Create database "upload" object.
2. Compress image files.
3. Upload all image files to cloud.
4. Update the upload object with links to the photos' location on the cloud.
5. Save the object.

The problem occured at Step 2. While compressing the images, we were left with a decent amount of garbage, that after a few uploads would hinder the server's performance. We tried to solve it by changing the configuration of the tool that we relied on for the compression but without success.

In the end, we decided to change our approach on the compression and move it from the backend to the frontend. We would essentially compress the images on the user's device and sent te compressed files to the server. This was a very impactful decision for 3 reasons:

1. We solved the memory leak problem.
2. We achieved better performance on the server by removing one task from it and making it handle smaller files.
3. We reduced our overall uploading times by moving smaller files through our requests.

Lastly, we have to mention that we tested different devices and we came to the conclusion that the performance toll on the phone was negligible, even on low end devices.


---

:question: We were concerned by our server's level of security.

:heavy_check_mark: We know that being 100% secure is technicaly impossible but we were not happy with how basic our server's security was. We researched and found different ways that could make our app a bit more secure. Those include the use of [helmet](https://www.npmjs.com/package/helmet), creating our own authentication system, separating the process that handles user authorization from the one that handles content. We also set up an SSL certificate to make all the requests HTTPS.



<p align="right">(<a href="#top">back to top</a>)</p>
