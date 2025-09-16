<?php

namespace App\Command;

use App\Entity\ChecklistItem;
use App\Entity\Country;
use App\Entity\Provider;
use App\Entity\ResidencyProgram;
use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;

#[AsCommand(
    name: 'app:seed:demo',
    description: 'Seeds the database with demo data for development',
)]
class SeedDemoCommand extends Command
{
    public function __construct(
        private EntityManagerInterface $entityManager,
        private UserPasswordHasherInterface $passwordHasher
    ) {
        parent::__construct();
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $io = new SymfonyStyle($input, $output);

        $io->title('Seeding demo data...');

        // Create admin user
        $this->createAdminUser($io);

        // Create countries
        $countries = $this->createCountries($io);

        // Create residency programs
        $this->createResidencyPrograms($io, $countries);

        // Create providers
        $this->createProviders($io, $countries);

        // Create checklist items
        $this->createChecklistItems($io, $countries);

        $this->entityManager->flush();

        $io->success('Demo data seeded successfully!');

        return Command::SUCCESS;
    }

    private function createAdminUser(SymfonyStyle $io): void
    {
        $existingUser = $this->entityManager->getRepository(User::class)
            ->findOneBy(['email' => 'admin@xandhopp.com']);

        if ($existingUser) {
            $io->note('Admin user already exists, skipping...');
            return;
        }

        $user = new User();
        $user->setEmail('admin@xandhopp.com');
        $user->setRole('admin');
        $user->setPasswordHash($this->passwordHasher->hashPassword($user, 'admin'));

        $this->entityManager->persist($user);
        $io->text('Created admin user: admin@xandhopp.com / admin');
    }

    private function createCountries(SymfonyStyle $io): array
    {
        $countriesData = [
            [
                'name' => 'Georgia',
                'slug' => 'georgia',
                'iso2' => 'GE',
                'continent' => 'Asia',
                'summary' => 'Georgia offers a unique blend of European and Asian cultures with attractive residency programs for digital nomads and investors.',
                'costOfLivingIndex' => '45.50',
                'taxRate' => '20.00'
            ],
            [
                'name' => 'Paraguay',
                'slug' => 'paraguay',
                'iso2' => 'PY',
                'continent' => 'South America',
                'summary' => 'Paraguay provides one of the easiest paths to permanent residency in South America with minimal investment requirements.',
                'costOfLivingIndex' => '38.20',
                'taxRate' => '10.00'
            ],
            [
                'name' => 'Hungary',
                'slug' => 'hungary',
                'iso2' => 'HU',
                'continent' => 'Europe',
                'summary' => 'Hungary offers EU access through various investor and residency programs, making it an attractive gateway to Europe.',
                'costOfLivingIndex' => '52.80',
                'taxRate' => '15.00'
            ]
        ];

        $countries = [];
        foreach ($countriesData as $data) {
            $existing = $this->entityManager->getRepository(Country::class)
                ->findOneBy(['slug' => $data['slug']]);

            if ($existing) {
                $countries[] = $existing;
                continue;
            }

            $country = new Country();
            $country->setName($data['name']);
            $country->setSlug($data['slug']);
            $country->setIso2($data['iso2']);
            $country->setContinent($data['continent']);
            $country->setSummary($data['summary']);
            $country->setCostOfLivingIndex($data['costOfLivingIndex']);
            $country->setTaxRate($data['taxRate']);

            $this->entityManager->persist($country);
            $countries[] = $country;
        }

        $io->text('Created ' . count($countriesData) . ' countries');
        return $countries;
    }

    private function createResidencyPrograms(SymfonyStyle $io, array $countries): void
    {
        $programsData = [
            [
                'country' => 'georgia',
                'type' => ResidencyProgram::TYPE_DIGITAL_NOMAD,
                'name' => 'Georgia Digital Nomad Visa',
                'requirements' => 'Remote work contract, minimum $2,000 monthly income, health insurance',
                'fees' => '57.00',
                'processingTimeDays' => 10
            ],
            [
                'country' => 'paraguay',
                'type' => ResidencyProgram::TYPE_RESIDENCY,
                'name' => 'Paraguay Permanent Residency',
                'requirements' => 'Bank deposit of $5,000, clean criminal record, health certificate',
                'fees' => '1500.00',
                'processingTimeDays' => 60
            ],
            [
                'country' => 'hungary',
                'type' => ResidencyProgram::TYPE_INVESTOR,
                'name' => 'Hungary Golden Visa',
                'requirements' => 'Investment of €250,000 in Hungarian real estate or government bonds',
                'fees' => '5000.00',
                'processingTimeDays' => 90
            ],
            [
                'country' => 'georgia',
                'type' => ResidencyProgram::TYPE_INVESTOR,
                'name' => 'Georgia Investor Visa',
                'requirements' => 'Investment of $300,000 in Georgian business or real estate',
                'fees' => '2000.00',
                'processingTimeDays' => 30
            ]
        ];

        foreach ($programsData as $data) {
            $country = array_filter($countries, fn($c) => $c->getSlug() === $data['country'])[0] ?? null;
            if (!$country) continue;

            $program = new ResidencyProgram();
            $program->setCountry($country);
            $program->setType($data['type']);
            $program->setName($data['name']);
            $program->setRequirements($data['requirements']);
            $program->setFees($data['fees']);
            $program->setProcessingTimeDays($data['processingTimeDays']);

            $this->entityManager->persist($program);
        }

        $io->text('Created ' . count($programsData) . ' residency programs');
    }

    private function createProviders(SymfonyStyle $io, array $countries): void
    {
        $providersData = [
            [
                'country' => 'georgia',
                'name' => 'Tbilisi Immigration Services',
                'city' => 'Tbilisi',
                'email' => 'info@tbilisi-immigration.ge',
                'phone' => '+995 32 2123456',
                'services' => 'Visa applications, residency permits, business registration, legal consultation',
                'rating' => '4.8'
            ],
            [
                'country' => 'paraguay',
                'name' => 'Asunción Legal Partners',
                'city' => 'Asunción',
                'email' => 'contact@asuncion-legal.py',
                'phone' => '+595 21 234567',
                'services' => 'Permanent residency, citizenship applications, real estate assistance',
                'rating' => '4.5'
            ],
            [
                'country' => 'hungary',
                'name' => 'Budapest Golden Visa Experts',
                'city' => 'Budapest',
                'email' => 'hello@budapest-visa.hu',
                'phone' => '+36 1 234 5678',
                'services' => 'Golden visa applications, EU residency, investment guidance, family reunification',
                'rating' => '4.9'
            ]
        ];

        foreach ($providersData as $data) {
            $country = array_filter($countries, fn($c) => $c->getSlug() === $data['country'])[0] ?? null;
            if (!$country) continue;

            $provider = new Provider();
            $provider->setCountry($country);
            $provider->setName($data['name']);
            $provider->setCity($data['city']);
            $provider->setEmail($data['email']);
            $provider->setPhone($data['phone']);
            $provider->setServices($data['services']);
            $provider->setRating($data['rating']);

            $this->entityManager->persist($provider);
        }

        $io->text('Created ' . count($providersData) . ' service providers');
    }

    private function createChecklistItems(SymfonyStyle $io, array $countries): void
    {
        $checklistData = [
            [
                'country' => 'georgia',
                'title' => 'Obtain apostilled criminal background check',
                'description' => 'Get a criminal background check from your home country and have it apostilled',
                'category' => 'Documentation',
                'orderIndex' => 1
            ],
            [
                'country' => 'georgia',
                'title' => 'Get health insurance',
                'description' => 'Obtain valid health insurance that covers Georgia',
                'category' => 'Health',
                'orderIndex' => 2
            ],
            [
                'country' => 'paraguay',
                'title' => 'Open bank account',
                'description' => 'Open a Paraguayan bank account and make the required deposit',
                'category' => 'Banking',
                'orderIndex' => 1
            ],
            [
                'country' => 'paraguay',
                'title' => 'Medical examination',
                'description' => 'Complete medical examination at approved clinic in Paraguay',
                'category' => 'Health',
                'orderIndex' => 2
            ]
        ];

        foreach ($checklistData as $data) {
            $country = array_filter($countries, fn($c) => $c->getSlug() === $data['country'])[0] ?? null;
            if (!$country) continue;

            $item = new ChecklistItem();
            $item->setCountry($country);
            $item->setTitle($data['title']);
            $item->setDescription($data['description']);
            $item->setCategory($data['category']);
            $item->setOrderIndex($data['orderIndex']);

            $this->entityManager->persist($item);
        }

        $io->text('Created ' . count($checklistData) . ' checklist items');
    }
}
