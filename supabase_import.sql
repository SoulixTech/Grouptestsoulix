-- Import Members
INSERT INTO members (name) VALUES
('Pranav Parate'),
('Prajwal Fating'),
('Tejas Ingole'),
('Tanmay Malvi'),
('Vaishnavi Dhopade'),
('Jayswita Gurde'),
('Palak Urkude'),
('Isha Urkude'),
('Pranav Navghare'),
('Rohit Bramhe'),
('Dh (parate)'),
('Vedant');

-- Import Expenses
INSERT INTO expenses (description, amount, paid_by, date, involved, split_type, split_details, category, notes) VALUES
('Metro', 91, 'Palak Urkude', '2025-09-04', ARRAY['Prajwal Fating','Tejas Ingole','Tanmay Malvi','Vaishnavi Dhopade','Jayswita Gurde','Palak Urkude','Isha Urkude','Pranav Navghare','Rohit Bramhe'], 'equal', '{"Isha Urkude": 10.1111111111111, "Jayswita Gurde": 10.1111111111111, "Palak Urkude": 10.1111111111111, "Prajwal Fating": 10.1111111111111, "Pranav Navghare": 10.1111111111111, "Rohit Bramhe": 10.1111111111111, "Tanmay Malvi": 10.1111111111111, "Tejas Ingole": 10.1111111111111, "Vaishnavi Dhopade": 10.1111111111111}'::jsonb, 'Transportation', ''),

('SIH RAISONI  CANTEEN', 1260, 'Palak Urkude', '2025-09-04', ARRAY['Pranav Parate','Prajwal Fating','Tejas Ingole','Tanmay Malvi','Vaishnavi Dhopade','Jayswita Gurde','Palak Urkude','Isha Urkude','Pranav Navghare','Rohit Bramhe'], 'equal', '{"Isha Urkude": 126, "Jayswita Gurde": 126, "Palak Urkude": 126, "Prajwal Fating": 126, "Pranav Navghare": 126, "Pranav Parate": 126, "Rohit Bramhe": 126, "Tanmay Malvi": 126, "Tejas Ingole": 126, "Vaishnavi Dhopade": 126}'::jsonb, 'Food & Drinks', ''),

('SHERUBHAI BIRYANI', 1260, 'Palak Urkude', '2025-11-19', ARRAY['Pranav Parate','Tejas Ingole','Palak Urkude','Isha Urkude','Pranav Navghare','Rohit Bramhe'], 'equal', '{"Isha Urkude": 210, "Palak Urkude": 210, "Pranav Navghare": 210, "Pranav Parate": 210, "Rohit Bramhe": 210, "Tejas Ingole": 210}'::jsonb, 'Food & Drinks', ''),

('bus ticket', 91, 'Rohit Bramhe', '2025-11-16', ARRAY['Prajwal Fating','Tejas Ingole','Tanmay Malvi','Pranav Navghare','Rohit Bramhe'], 'equal', '{"Prajwal Fating": 18.2, "Pranav Navghare": 18.2, "Rohit Bramhe": 18.2, "Tanmay Malvi": 18.2, "Tejas Ingole": 18.2}'::jsonb, 'Transportation', 'bus from medical chock to telephone chock'),

('Noodles and Manchurian', 300, 'Pranav Navghare', '2025-11-16', ARRAY['Prajwal Fating','Tejas Ingole','Tanmay Malvi','Pranav Navghare','Rohit Bramhe'], 'equal', '{"Prajwal Fating": 60, "Pranav Navghare": 60, "Rohit Bramhe": 60, "Tanmay Malvi": 60, "Tejas Ingole": 60}'::jsonb, 'Food & Drinks', 'noodles and manchurian'),

('vr mall after meal of boys', 290, 'Pranav Navghare', '2025-11-16', ARRAY['Tejas Ingole','Tanmay Malvi','Pranav Navghare','Rohit Bramhe','Vedant'], 'equal', '{"Pranav Navghare": 58, "Rohit Bramhe": 58, "Tanmay Malvi": 58, "Tejas Ingole": 58, "Vedant": 58}'::jsonb, 'Food & Drinks', 'so ma bol rhah hu tum samaj gye honga vr ka baad jo gyea tha wo'),

('sweets and wafers', 325, 'Pranav Navghare', '2025-11-16', ARRAY['Prajwal Fating','Tejas Ingole','Tanmay Malvi','Pranav Navghare','Rohit Bramhe'], 'equal', '{"Prajwal Fating": 65, "Pranav Navghare": 65, "Rohit Bramhe": 65, "Tanmay Malvi": 65, "Tejas Ingole": 65}'::jsonb, 'Food & Drinks', 'sweets and namkeen'),

('Birthday Party', 2465, 'Pranav Navghare', '2025-11-15', ARRAY['Pranav Parate','Tejas Ingole','Vaishnavi Dhopade','Jayswita Gurde','Palak Urkude','Isha Urkude','Pranav Navghare'], 'equal', '{"Isha Urkude": 352.142857142857, "Jayswita Gurde": 352.142857142857, "Palak Urkude": 352.142857142857, "Pranav Navghare": 352.142857142857, "Pranav Parate": 352.142857142857, "Tejas Ingole": 352.142857142857, "Vaishnavi Dhopade": 352.142857142857}'::jsonb, 'Birthday Party', 'total cost of birthday party'),

('shreya ghoshal khasdar mahotsav', 900, 'Pranav Navghare', '2025-11-11', ARRAY['Prajwal Fating','Tejas Ingole','Tanmay Malvi','Vaishnavi Dhopade','Jayswita Gurde','Pranav Navghare','Rohit Bramhe'], 'equal', '{"Jayswita Gurde": 128.571428571429, "Prajwal Fating": 128.571428571429, "Pranav Navghare": 128.571428571429, "Rohit Bramhe": 128.571428571429, "Tanmay Malvi": 128.571428571429, "Tejas Ingole": 128.571428571429, "Vaishnavi Dhopade": 128.571428571429}'::jsonb, 'Night Out', 'total 1400 for 10 pass sold one pass at 500 rs');

-- Import Payments
INSERT INTO payments (from_user, to_user, amount, date) VALUES
('Pranav Parate', 'Pranav Navghare', 200, '2025-11-17T19:34:20.250Z'),
('Vaishnavi Dhopade', 'Pranav Navghare', 340, '2025-11-17T19:37:35.615Z'),
('Jayswita Gurde', 'Pranav Navghare', 200, '2025-11-17T19:38:01.142Z'),
('Tanmay Malvi', 'Pranav Navghare', 150, '2025-11-17T19:39:11.953Z'),
('Tejas Ingole', 'Pranav Navghare', 460, '2025-11-17T19:40:47.329Z'),
('Rohit Bramhe', 'Palak Urkude', 80, '2025-11-20T08:23:13.175Z'),
('Pranav Parate', 'Palak Urkude', 160, '2025-11-20T08:23:38.500Z'),
('Isha Urkude', 'Pranav Navghare', 308, '2025-11-20T08:27:10.961Z'),
('Rohit Bramhe', 'Pranav Navghare', 100, '2025-11-20T09:43:25.564Z');
