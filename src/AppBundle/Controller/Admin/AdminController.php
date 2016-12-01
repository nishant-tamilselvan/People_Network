<?php
/**
 * Created by PhpStorm.
 * User: nishantisme
 * Date: 01/12/2016
 * Time: 01:39
 */

namespace AppBundle\Controller\Admin;


use Doctrine\ORM\Mapping as ORM;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Security;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\Request;

/**
 * Class AdminController
 * @Security("is_granted('ROLE_ADMIN')")
 * @package AppBundle\Controller\Admin
 * @ORM\Entity
 * @Route("/admin")
 */
class AdminController extends Controller
{
    /**
     * @param Request $request
     * @return \Symfony\Component\HttpFoundation\Response
     * @Route("/dashboard", name="admin_dashboard")
     */
    public function adminDashAction(Request $request)
    {
        return $this->render(':admin:admin_dashboard.html.twig');
    }



}