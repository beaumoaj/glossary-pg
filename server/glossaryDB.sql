--
-- Table structure for table admins
--

DROP TABLE IF EXISTS term_resources;
DROP TABLE IF EXISTS terms;
DROP TABLE IF EXISTS contributors;
DROP TABLE IF EXISTS admins;
DROP TYPE IF EXISTS link_t;


CREATE TABLE admins (
  id SERIAL PRIMARY KEY,
  admin_name varchar(100) NOT NULL,
  email varchar(100),
  admin_password varchar(30)
);

INSERT INTO admins (admin_name, email, admin_password) VALUES ('Tony','tony@example.com','t0nyp455');

--
-- Table structure for table contributors
--

CREATE TABLE contributors (
  id SERIAL PRIMARY KEY,
  contributor_name varchar(120) NOT NULL,
  region varchar(20) NOT NULL,
  email varchar(30),
  password text NOT NULL
);

--
-- Dumping data for table contributors
--

INSERT INTO contributors (contributor_name, region, email, password) VALUES 
  ('Tony','UK','tony@example.com','$2b$10$mRSPKDfDtW2K7IuejHn1POeyYcjh/.uE.YmA7tvaRlTVT0y5l9pl6'),
  ('John','UK','john@example.com','$2b$10$hNnbCyg92ITxvvkNTeeVeerTEGB..F7/f9sESLhacqGE7p4gYdrDW'),
  ('Pete','UK','pete@example.com','$2b$10$iZfO1bNAIgSt4NVsV8FP.OUyD0e.sbUQqPJ/vlIGCTfy1mtNgPoqy'),
  ('Mark','West Midlands','mark@example.com','$2b$10$BiMDLIUU0iPqtFP.GFj8TeHMIa2P/EgXHWZgXl/kR3UNnL.23oEtK');

--
-- Table structure for table terms
--

CREATE TABLE terms (
  id SERIAL PRIMARY KEY,
  term varchar(30) NOT NULL,
  definition text NOT NULL,
  contributor_id INT REFERENCES contributors(id),
  creation_date timestamp DEFAULT CURRENT_TIMESTAMP,
  last_edit_date timestamp
);

--
-- Trigger function to update timestamp
--
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_edit_date = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

--
-- Create trigger to update last_edit_date
--

CREATE TRIGGER set_timestamp
BEFORE UPDATE ON terms
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();

--
-- Dumping data for table terms
--

INSERT INTO terms (term, definition, contributor_id, creation_date) VALUES 
  ('boolean','A type with two values, true or false used in boolean expressions.',1,'2021-06-11 18:26:47'),
  ('variable','A way to store a single value',1,'2021-06-11 19:30:51');

UPDATE terms SET contributor_id = 1 WHERE id = 2;

--
-- Table structure for table term_resources
--

CREATE TYPE link_t AS ENUM ('video', 'web');

CREATE TABLE term_resources (
  id SERIAL PRIMARY KEY,
  termid INT REFERENCES terms(id),
  link text NOT NULL,
  linktype link_t NOT NULL,
  language varchar(255) NOT NULL
);

--
-- Dumping data for table term_resources
--

INSERT INTO term_resources (termid, link, linktype, language) VALUES 
  (1,'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference','web','javascript'),
  (1,'https://www.w3schools.com/js/js_booleans.asp','web','javascript'),
  (2,'https://www.w3schools.com/js/js_variables.asp','web','javascript');
