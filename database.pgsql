CREATE DATABASE rsdrummingstudio;

\c rsdrummingstudio

CREATE TABLE Users(
    id SERIAL, 
    firstName varchar(25) NOT NULL,
    lastName varchar(30) NOT NULL,
    email varchar(50) NOT NULL UNIQUE,
    passwordhash varchar(300) NOT NULL,
    DOB date  NOT NULL,
    active boolean NOT NULL DEFAULT true, 
    student boolean NOT NULL DEFAULT false,
    admin boolean NOT NULL DEFAULT false, 
    createdAt TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (id)
);

CREATE TABLE Lessons(
    id SERIAL, 
    lessonNumber int DEFAULT 0,
    lessonLevel int NOT NULL, 
    coverImg varchar(300) NOT NULL, 
    auxImg varchar(300),
    title varchar(50) NOT NULL,
    description TEXT,
    createdAt TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (id)
);

CREATE TABLE Users_Lessons(
    id SERIAL, 
    student_id int NOT NULL,
    lesson_id int NOT NULL,
    completed boolean NOT NULL DEFAULT false,
    createdAt TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (student_id, lesson_id),
    PRIMARY KEY (id),
    FOREIGN KEY (student_id) REFERENCES Users (id) ON DELETE CASCADE,
    FOREIGN KEY (lesson_id) REFERENCES Lessons (id) ON DELETE CASCADE
);

CREATE TABLE comments(
    id SERIAL,
    comment text NOT NULL,
    userId int NOT NULL,
    firstName varchar(25) NOT NULL,
    read boolean DEFAULT false, 
    lesson_id int NOT NULL,
    response boolean NOT NULL,
    createdAt TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (id),
    FOREIGN KEY (lesson_id) REFERENCES Lessons (id) ON DELETE CASCADE,
    FOREIGN KEY (userId) REFERENCES Users (id) ON DELETE CASCADE
);

CREATE TABLE Assignments(
    id SERIAL, 
    assignmentNumber int NOT NULL,
    primaryImg varchar(300), 
    auxImg varchar(300), 
    title varchar(50) NOT NULL,
    description text NOT NULL,
    linkName varchar(150),
    url varchar(500), 
    lesson_id int NOT NULL, 
    createdAt TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (id),
    FOREIGN KEY (lesson_id) REFERENCES Lessons (id) ON DELETE CASCADE
);

CREATE TABLE Users_Assignments(
    id SERIAL, 
    users_lessons_id int NOT NULL, 
    student_id int NOT NULL,
    assignment_id int NOT NULL,
    completed boolean NOT NULL DEFAULT false,
    createdAt TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (student_id, assignment_id),
    PRIMARY KEY (id),
    FOREIGN KEY (users_lessons_id) REFERENCES Users_Lessons (id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES Users (id) ON DELETE CASCADE,
    FOREIGN KEY (assignment_id) REFERENCES Assignments (id) ON DELETE CASCADE
);

CREATE TABLE videos(
    id SERIAL, 
    videoUrl varchar(300) NOT NULL UNIQUE,
    title varchar(250) NOT NULL UNIQUE,
    description text NOT NULL,
    instructional boolean NOT NULL DEFAULT false,
    createdAt TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (id)
);

CREATE TABLE tags(
    id SERIAL, 
    tag_name varchar(50) NOT NULL UNIQUE,
    PRIMARY KEY (id)
);

CREATE TABLE video_tags(
    id SERIAL,
    tag_id int NOT NULL,
    video_id int NOT NULL,
    PRIMARY KEY (id),
    FOREIGN KEY(tag_id) REFERENCES tags (id) ON DELETE CASCADE,
    FOREIGN KEY(video_id) REFERENCES videos (id) ON DELETE CASCADE
);

CREATE TABLE packages(
    id SERIAL,
    price int NOT NULL,
    title varchar(150) NOT NULL UNIQUE,
    numberOfLessons int NOT NULL,
    PRIMARY KEY (id)
);

CREATE TABLE payments(
    id SERIAL,
    userId int NOT NULL,
    cardHoldersName varchar(255) NOT NULL,
    email varchar(255) NOT NULL,
    chargeAmount int NOT NULL,
    itemTitle varchar(150) NOT NULL,
    numberOfLessons int, 
    purchaseQuantity int NOT NULL,
    chargeDate TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (id)
);