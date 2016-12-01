<?php
/**
 * Created by PhpStorm.
 * User: nishantisme
 * Date: 01/12/2016
 * Time: 18:11
 */

namespace AppBundle\DataFixtures\ORM;


use AppBundle\Entity\User;
use Doctrine\Common\DataFixtures\FixtureInterface;
use Doctrine\Common\Persistence\ObjectManager;

class LoadFixtures implements FixtureInterface
{
    public function load(ObjectManager $manager)
    {
        $userList = array(1,2,3,4,5,6,7,8,9);
        foreach ($userList as $value )
        {
            $user = new User();
            $user->setEmail("cssadmin".$value."@gmail.com");
            $user->setPassword(sha1("cssadmin".$value));
            $manager->persist($user);

        }
        $manager->flush();


    }

}