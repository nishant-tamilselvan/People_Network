<?php
/**
 * Created by PhpStorm.
 * User: nishantisme
 * Date: 01/12/2016
 * Time: 01:45
 */

namespace AppBundle\Controller\Admin;


use AppBundle\Form\LoginForm;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\Request;

/**
 * Class SecurityController
 * @package AppBundle\Controller\Admin
 */
class SecurityController extends Controller
{
    /**
     * @Route("/login", name="security_login")
     */
    public function loginAction(Request $request)
    {
        $authenticationUtils = $this->get('security.authentication_utils');

        // get the login error if there is one
        $error = $authenticationUtils->getLastAuthenticationError();

        // last username entered by the user
        $lastUsername = $authenticationUtils->getLastUsername();

        $form = $this->createForm(LoginForm::class,
            ['username' => $lastUsername]
            );
        return $this->render(
            ':default:login.html.twig',
            array(
                'form' => $form->createView(),
                'error'=> $error
            )
        );


    }


    /**
     * @throws \Exception
     * @Route("/logout", name="security_logout")
     */
    public function logoutAction()
    {
        throw new \Exception('This shoud not be reached');
    }

}