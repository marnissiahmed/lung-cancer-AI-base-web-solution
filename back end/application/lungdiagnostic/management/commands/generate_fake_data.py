from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta,date
from faker import Faker
import random

from lungdiagnostic.models import Medcine, Patient  # Import your models

class Command(BaseCommand):
    help = 'Generate fake data for Medcine and Patient models'

    def handle(self, *args, **kwargs):
        fake = Faker()
        # Get the start and end dates of the current week
        today = date.today()

        # Calculate the start date of the current week (Monday)
        start_of_week = today - timedelta(days=today.weekday())

        # Calculate the end date of the current week (Sunday)
        end_of_week = start_of_week + timedelta(days=6)

        # Generate fake Patient instances
        for _ in range(20):  # Adjust the number of instances you want to create
            # Select a random Medcine instance to associate with the patient
            random_medcine = random.choice(Medcine.objects.exclude(occupation='admin'))

            # Generate a random date within the current week, including the previous day
            random_date = fake.date_time_between(
                start_date=start_of_week - timedelta(days=1),
                end_date=end_of_week
            )

            # Directly set the date within the loop
            patient = Patient(
                name=fake.first_name(),
                last_name=fake.last_name(),
                location=fake.city(),
                age=random.randint(18, 80),  # Adjust the age range as needed
                email=fake.email(),
                date_added=random_date,  # Set the random date
                medicine=random_medcine,  # Associate the patient with a Medcine instance
            )
            patient.save()

        self.stdout.write(self.style.SUCCESS('Fake data has been generated successfully.'))
