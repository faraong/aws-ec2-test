Feature: Creating an AWS EC2 Instance
	As an AWS user
	I want to be able to create an EC2 instance
	Check that it is working
	And destroy the instance

	Scenario: AWS EC2 Instance creation
		When I create an AWS EC2 instance named "test"
		Then I should see a working instance
		Then I should delete the instance
