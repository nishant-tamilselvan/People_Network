<?php

namespace AppBundle\Controller;

use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\Request;

/**
 * Class DefaultController
 * @package AppBundle\Controller
 */
class DefaultController extends Controller
{
    /**
     * @Route("/", name="homepage")
     */
    public function landingPageAction(Request $request)
    {
        // replace this example code with whatever you need
        return $this->render('default/index.html.twig');
    }


    /**
     * @param Request $request
     * @return \Symfony\Component\HttpFoundation\Response
     * @Route("/about", name="aboutPage")
     */
    public function aboutAction(Request $request)
    {
        return $this->render('default/about.html.twig');
    }

    /**
     * @param Request $request
     * @return \Symfony\Component\HttpFoundation\Response
     * @Route("/team", name="teamPage")
     */
    public function teamAction(Request $request){
        return $this->render('default/team.html.twig');
    }

    /**
     * @param Request $request
     * @return \Symfony\Component\HttpFoundation\Response
     * @Route("/wiki", name="wikiPage")
     */
    public function wikiAction(Request $request){
        return $this->render('default/wiki.html.twig');
    }

}
