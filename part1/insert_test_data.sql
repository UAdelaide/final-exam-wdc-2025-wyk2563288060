USE DogWalkService;

-- Insert 5 users
INSERT INTO Users (username, email, password_hash, role) VALUES
('alice123', 'alice@example.com', 'hashed123', 'owner'),
('bobwalker', 'bob@example.com', 'hashed456', 'walker'),
('carol123', 'carol@example.com', 'hashed789', 'owner'),
('daviddog', 'david@example.com', 'hashed321', 'owner'),
('ellawalk', 'ella@example.com', 'hashed654', 'walker');

-- Insert 5 dogs
INSERT INTO Dogs (owner_id, name, size) VALUES
((SELECT user_id FROM Users WHERE username = 'alice123'), 'Max', 'medium'),
((SELECT user_id FROM Users WHERE username = 'carol123'), 'Bella', 'small'),
((SELECT user_id FROM Users WHERE username = 'daviddog'), 'Rocky', 'large'),
((SELECT user_id FROM Users WHERE username = 'alice123'), 'Luna', 'small'),
((SELECT user_id FROM Users WHERE username = 'daviddog'), 'Milo', 'medium');

-- Insert 5 walk requests
INSERT INTO WalkRequests (dog_id, requested_time, duration_minutes, location, status) VALUES
((SELECT dog_id FROM Dogs WHERE name = 'Max'), '2025-06-10 08:00:00', 30, 'Parklands', 'open'),
((SELECT dog_id FROM Dogs WHERE name = 'Bella'), '2025-06-10 09:30:00', 45, 'Beachside Ave', 'accepted'),
((SELECT dog_id FROM Dogs WHERE name = 'Rocky'), '2025-06-11 10:00:00', 60, 'Hilltop Park', 'open'),
((SELECT dog_id FROM Dogs WHERE name = 'Luna'), '2025-06-11 14:00:00', 20, 'Central Garden', 'cancelled'),
((SELECT dog_id FROM Dogs WHERE name = 'Milo'), '2025-06-12 16:00:00', 40, 'Lakeside Trail', 'completed');
