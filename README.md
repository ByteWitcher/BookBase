# Project overview

In group of four students, you will be in charge of developing a REST/RESTful application of your choice in Node.JS. You are responsible of choosing the kind of APIs you wish to develop, writing the specification, and developing and testing the API through a top-down approach. You will also be in charge of automating your process, from merge request to test, packaging, and deployment on a public repository.

Some ideas of APIs:  code snippet retrieval, cooking recipes, playlist management, etc. Be original.

The application consists of both a backend written in Node.JS (to implement the different services the application is supposed to provide) and an API to specify/document the services provided by the server. The backend implementation must be fully compliant with the specification.

In addition to functional requirements, your specification must contain non-functional considerations. Examples of such considerations include: how is the API protected (simple password, OAuth 2.0, etc.), how the backend is implemented and evaluated (use of HTTP/2, what are the metrics used to measure the performance of the API and the expected performance to reach, and  etc.).

## Steps for developing the API

To develop the API, you will have to:

**Create the software specification:**
: Write your software specification in natural language. It should include both functional and non-functional requirements: what your API is supposed to do, who are the actors, what are the concepts manipulated, how is the API protected, etc.

**Formalise the system using OpenAPI and Swagger:**
: an OpenAPI specification consists in defining all the possible HTTP requests that can be done to interrogate the API, query some information, and/or update it. It should also describe the different concepts manipulated (called *components*).

**Implement the server:**
: The server must be implemented in Node.JS. Although some tools such as Swagger allows you to generate the skeleton of the server (handling the HTTP requests -- the logic has still to be implemented by hand), we recommend you to implement your server by hand, such that you have full control of your server and the optimisation you will be able to improve the performance of your REST application.

**Manage data:**
: Data must be delivered by the API. You can use the database management system of your choice, as long as it is easy to install and to deploy in a docker image (see below).

**Test the API and provide analysis reports:**
: You will have to specify a test suite and write the different tests of your server. You will focus on structural/functional tests, and you will evaluate the completeness of the test suite using different metrics of code coverage/mutation testing. SonarQube will be used to generate quality analysis reports.

**Build a Node.JS package/docker images:**
: The API implementation must be deployed as a Node.JS package and provided docker images to be able to execute it.

**Automate the full process:**
: You will implement a CI/CD pipeline on Gitlab to support the automatic building, test regression, version management, and quality analysis reports.

**Provide a user guide:**
: The user guide should explain how the API can be used, which are the kinds of requests that could be done.

**Provide developer artifacts at the destination of developers/maintainers/teacher:**
: Such artifacts may include changelogs, technical debts, styling conventions applied, Architectural Decision Request, etc.

## Evaluation criteria

Different evaluation criteria will be taken into considerations for evaluating your API, among which:

**API complexity**
: The API is complex enough to guarantee that all parts of the course are covered, but not too complex to be done in a reasonable amount of time, according to the given calendar.

**Quality of the artifacts/implementation**
: The produced artifacts (being code, test suites, analysis reports, etc.) must be of high quality.

**Consistency across the different phases/artifacts**
: The consistency across the different phases/artifacts is an important criteria of evaluation. Example of inconsistencies that can be observed: some HTTP routes implemented in the server are not defined as such in the OpenAPI specification. In case you know such inconsistencies exists but would not have time to fix them on time, please mention it as technical debt in the developer artifacts.

**Respect of the instructions/involvement of the group members**
: The respect of the given instructions and submitting the different artifacts when required will be taken into consideration in the final grade.

**Usage of Git and GitLab CI/CD**
: Git is satisfactorily used as a version control system in the project, with branches, regular commits, relevant commit messages, possibly tags, etc. Gitflow is adopted in the project. Automation is configured and working properly.

**Functional and non-functional requirements**
: The project satisfactorily includes and implements functional and non-functional requirements.

**User guide**
: A user guide is provided explaining how the API can be used.

## Artifacts

The table below details the different artifacts to hand-in. **The final submission deadline is November, 28th, 5pm.**

| Name of the artifact                            | Format             | Hand-in platform                                   |
|-------------------------------------------------|--------------------|----------------------------------------------------|
| Group creation                                  | -                  | [Google form](https://forms.gle/xvyBZwbsXdyM4acN6) |
| System specification in natural language        | Markdown           | Gitlab                                             |
| OpenAPI specification                           | YAML specification | Gitlab                                             |
| Server implementation (partial)                 | code               | Gitlab + Gitlab registry                           |
| Pipeline                                        | YAML specification | Gitlab                                             |
| Final implementation + test + SonarQube reports | code               | Gitlab                                             |