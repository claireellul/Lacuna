<?php

// to do: add support for holes see here: http://www.cs.cmu.edu/~quake/triangle.html and here: https://code.google.com/p/poly2tri/

/* * *************************************************************
 * Copyright notice
 *
 * (c) 2013 Chi Hoang (info@chihoang.de)
 *  All rights reserved
 *
 * **************************************************************/

define("EPSILON",0.000000001);
define("SUPER_TRIANGLE",(float)1000000000);
  // circum circle
class Circle
{
   var $x, $y, $r, $r2, $colinear;
   function Circle($x, $y, $r, $r2, $colinear)
   {
      // centre x and y
      $this->x = $x;
      $this->y = $y;
      // radius
      $this->r = $r;

      // radius squared
      $this->r2 = $r2;


      $this->colinear=$colinear;
   }
}

class visualize
{
   var $path;
   var $pObj;

   function visualize($path,$pObj)
   {
      $this->path=$path;
      $this->pObj=$pObj;
   }

   function erropen()
   {
      print "Cannot open file";
      exit;
   }

   function errwrite()
   {
      print "Cannot write file";
      exit;
   }

   function genimage()
   {
         // Generate the image variables
      $im = imagecreatetruecolor($this->pObj->stageWidth,$this->pObj->stageHeight);
      $white = imagecolorallocate ($im,0xff,0xff,0xff);
      $black = imagecolorallocate($im,0x00,0x00,0x00);
      $gray_lite = imagecolorallocate ($im,0xee,0xee,0xee);
      $gray_dark = imagecolorallocate ($im,0x7f,0x7f,0x7f);

      // Fill in the background of the image
      imagefilledrectangle($im, 0, 0, $this->pObj->stageWidth+100, $this->pObj->stageHeight+100, $white);

      foreach ($this->pObj->delaunay as $key => $arr)
      {
         foreach ($arr as $ikey => $iarr)
         {
            list($x1,$y1,$x2,$y2) = $iarr;
            imageline($im,$x1+5,$y1+5,$x2+5,$y2+5,$gray_dark);
	 }
      }

      ob_start();
      imagepng($im);
      $imagevariable = ob_get_contents();
      ob_clean();

         // write to file
      $filename = $this->path."tri_". rand(0,1000).".png";
      $fp = fopen($filename, "w");
      fwrite($fp, $imagevariable);
      if(!$fp)
      {
         $this->errwrite();
      }
      fclose($fp);
   }

   function tri()
   {
      if (!$handle = fopen($this->path."tri.csv", "w"))
      {
         $this->erropen();
      }
      rewind($handle);
      $c=0;
      foreach ($this->pObj->delaunay as $key => $arr)
      {
         foreach ($arr as $ikey => $iarr)
         {
            if ( !fwrite ( $handle, $iarr[0].",".$iarr[1]."\n" ) )
            {
               $this->errwrite();
            }
         }
      }
      fclose($handle);
   }

   function pset($path)
   {
      if (!$handle = fopen($this->path."pset.csv", "w"))
      {
         $this->erropen();
      }
      rewind($handle);
      $c=0;
      foreach ($this->pObj->pointset as $key => $arr)
      {
         if ( !fwrite ($handle, $arr[0].",".$arr[1]."\n" ) )
         {
            $this->errwrite();
         }
      }
      fclose($handle);
   }
}

class DelaunayTriangulation
{
   var $v = array();
   var $complete = array();
   var $stageWidth = 400;
   var $stageHeight = 400;
   var $delaunay = array();
   var $pointset = array();
   var $indices = array();

   function GetCircumCenter($Ax, $Ay, $Bx, $By, $Cx, $Cy)
   {
      //$Ax = 5;
      //$Ay = 7;
      //$Bx = 6;
      //$By = 6;
      //$Cx = 2;
      //$Cy = -2;

      //$Ax = 5;
      //$Ay = 1;
      //$Bx = -2;
      //$By = 0;
      //$Cx = 4;
      //$Cy = 8;

      $MidSideAx = (($Bx + $Ax)/2.0);
      $MidSideAy = (($By + $Ay)/2.0);

      $MidSideBx = (($Bx + $Cx)/2.0);
      $MidSideBy = (($By + $Cy)/2.0);

      $MidSideCx = (($Cx + $Ax)/2.0);
      $MidSideCy = (($Cy + $Ay)/2.0);

      //Inverted Slopes of two Perpendicular lines of the Triangle y = mx + c
      $SlopeAB = (-(($Bx - $Ax)/($By - $Ay)));
      $SlopeBC = (-(($Cx - $Bx)/($Cy - $By)));
      $SlopeCA = (-(($Cx - $Ax)/($Cy - $Ay)));

      //Cab
      $Cab = -1 * ($SlopeAB * $MidSideAx - $MidSideAy);

      //Cba
      $Cbc = -1 * ($SlopeBC * $MidSideBx - $MidSideBy);

      //Cac
      $Cac = -1 * ($SlopeCA * $MidSideCx - $MidSideCy);

      //intersection
      $CircumCenterX = ($Cab - $Cbc) / ($SlopeBC - $SlopeAB);
      $CircumCenterY = $SlopeCA * $CircumCenterX + $Cac;

      return array(round($CircumCenterX), round($CircumCenterY));
   }

   //LEFT_SIDE = true, RIGHT_SIDE = false, 2 = COLINEAR
   // checks whether px py is to the left or right of the directed vector x1 y1 x2 y2
   function side($x1,$y1,$x2,$y2,$px,$py)
   {

   //echo("<br> x1 ".$x1." y1 ".$y1." x2 ".$x2." y2 ".$y2." px ".$px." py ".$py);
      $dx1 = $x2 - $x1;
      $dy1 = $y2 - $y1;
      $dx2 = $px - $x1;
      $dy2 = $py - $y1;
      //echo("<br> dx dy dx1 ".$dx1." dy1 ".$dy1." dx2 ".$dx2." dy2 ".$dy2);
      $o = ($dx1*$dy2)-($dy1*$dx2);
      //echo("<br> o ".$o);
      if ($o > 0.0){
      //echo(" xxx 0");
      return(0);}
      if ($o < 0.0) {
      //echo ("yyy 1");
      return(1);}
      //echo("zero zero");
      return(-1);
   }
// calculate the circum circle of the triangle
// for a delaunay, no other node in the triangulation should be inside this circumcircle
// except for the three nodes of the triangle itself

   function CircumCircle($x1,$y1,$x2,$y2,$x3,$y3)
   {
      //list($x1,$y1)=array(1,3);
      //list($x2,$y2)=array(6,5);
      //list($x3,$y3)=array(4,7);

      $absy1y2 = abs($y1-$y2);
      $absy2y3 = abs($y2-$y3);

         //echo("x2 b ".$x2."<br>");
         //echo("x1 b ".$x1."<br>");
         //echo("x3 b ".$x3."<br>");
         //echo("y2 b ".$y2."<br>");
         //echo("y1 b ".$y1."<br>");
         //echo("y3 b ".$y3."<br>");

      if ($absy1y2 < EPSILON)
      {
         $m2 = - ($x3-$x2) / ($y3-$y2);
         $mx2 = ($x2 + $x3) / 2.0;
         $my2 = ($y2 + $y3) / 2.0;
         $xc = ($x2 + $x1) / 2.0;
         $yc = $m2 * ($xc - $mx2) + $my2;
      }
      else if ($absy2y3 < EPSILON)
      {
         $m1 = - ($x2-$x1) / ($y2-$y1);
         $mx1 = ($x1 + $x2) / 2.0;
         $my1 = ($y1 + $y2) / 2.0;
         $xc = ($x3 + $x2) / 2.0;
         $yc = $m1 * ($xc - $mx1) + $my1;
      }
      else
      {
         //echo("x2 ".$x2."<br>");
         //echo("x1 ".$x1."<br>");
         //echo("x3 ".$x3."<br>");
         //echo("y2 ".$y2."<br>");
         //echo("y1 ".$y1."<br>");
         //echo("y3 ".$y3."<br>");
         $m1 = - ($x2-$x1) / ($y2-$y1);
         $m2 = - ($x3-$x2) / ($y3-$y2);
         $mx1 = ($x1 + $x2) / 2.0;
         $mx2 = ($x2 + $x3) / 2.0;
         $my1 = ($y1 + $y2) / 2.0;
         $my2 = ($y2 + $y3) / 2.0;
         //echo("m1 ".$m1."<br>");
         //echo("m2 ".$m2."<br>");
         $xc = ($m1 * $mx1 - $m2 * $mx2 + $my2 - $my1) / ($m1 - $m2);
         if ($absy1y2 > $absy2y3)
         {
            $yc = $m1 * ($xc - $mx1) + $my1;
         } else
         {
            $yc = $m2 * ($xc - $mx2) + $my2;
         }
      }

      $dx = $x2 - $xc;
      $dy = $y2 - $yc;
      $rsqr = $dx*$dx + $dy*$dy;
      $r = sqrt($rsqr);
	  $colinear = false;
      /* Check for coincident points */
      if($absy1y2 < EPSILON && $absy2y3 < EPSILON)
      {
      	// think this is wrong - if both y1-y2 and y2 - y3 are very small, then this is colinear
      	// nb the colinear variable from the circle doesnt seem to be used!
      //   $colinear=false;
         $colinear=true;
      } else
      {
         $colinear=false;
      }
      //echo("<br>colinear ".$colinear."<br>");
      return new Circle($xc, $yc, $r, $rsqr, $colinear);
   }

   function inside(Circle $c, $x, $y)
   {
      $dx = $x - $c->x;
      $dy = $y - $c->y;
      $drsqr = $dx * $dx + $dy * $dy;
     /* //echo("<br> INSIDE $x");
      //echo("<br> INSIDE $y");
      //echo("<br> INSIDE $dx");
      //echo("<br> INSIDE $dy");
      //echo("<br> INSIDE $c->x");
      //echo("<br> INSIDE $c->y");
      //echo("<br> INSIDE $drsqr");
      //echo("<br> INSIDE $c->r2");*/
      $temp = $drsqr-$c->r2;
      //echo("<br> INSIDE $temp");
      //$inside = ($drsqr <= $c->r2) ? true : false;

      // if the distance from the point in question to the centre of the circle - the radius of the circle is negative or
      // very close to 0 then the point is inside
      $inside = (($drsqr-$c->r2) <= EPSILON) ? true : false;
      //$inside = $inside & $c->colinear;
      //$inside = $inside & ($c->r > EPSILON) ? true : false;
      return $inside;
   }

   function getEdges($n, $x, $y, $z)
   {
      /*
         Set up the supertriangle
         This is a triangle which encompasses all the sample points.
         The supertriangle coordinates are added to the end of the
         vertex list. The supertriangle is the first triangle in
         the triangle list.
      */

      $x[$n+0] = -SUPER_TRIANGLE;
      $y[$n+0] = SUPER_TRIANGLE;
      $x[$n+1] = 0;
      $y[$n+1] = -SUPER_TRIANGLE;
      $x[$n+2] = SUPER_TRIANGLE;
      $y[$n+2] = SUPER_TRIANGLE;

      // indices
      $this->v = array();
      array_push($this->v, array($n,$n+1,$n+2));

      //sort buffer
      $this->complete = array(false);

      /*
         Include each point one at a time into the existing mesh
      */
        	//echo("<br><br> x");
        	//print_r($x);
      // $key is the key, $array is the value for each item in array $x
      // $x is the array that contains all the x values PLUS the three great circle values of -1000000000, 0 and 1000000000
      // i.e. 7 values in total for our test iteration
      foreach ($x as $key => $arr)
      {
        	//echo("<br><br>start of x loop x key xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx ");
        	//print_r($key);
        	//echo(" value ");
        	//print_r($arr);
         /*
            Set up the edge buffer.
            If the point (xp,yp) lies inside the circumcircle then the
            three edges of that triangle are added to the edge buffer
            and that triangle is removed.
         */
        	//echo("<br><br> v");
        	//print_r($this->v);

         $edges=array();
         // $vkey is the key, $varr is the value for each item in array $v
         // $v is the array that contains the list of node ids that make up a triangle
         // the starting point for the loop  - i.e. the first triangle - is the supertriangle - i.e. the last 3 values added to the x array
         foreach ($this->v as $vkey => $varr)
         {
        	//echo("<br><br>start of v loop v key vvvvvvvvvvvvvvvvvvvvvvvvvvv ");
        	//print_r($vkey);
        	//echo(" value ");
        	//print_r($varr);
        	// continue = skip the rest of the loop and move to the next iteration
        	if ($this->complete[$vkey]) {
        	//echo ("contining");
        	continue;}

        	// list = assign variables as if they were in an array
        	// i.e. $vi = $v[$vkey][0]
            list($vi,$vj,$vk)=array($this->v[$vkey][0],$this->v[$vkey][1],$this->v[$vkey][2]);
			// edges takes the list of three nodes that form the $v triangle
			// and creates 3 edges made of two nodes each
			// the edges are directed to ensure that the resulting triangle is ?? clockwise??
			//echo($vi." xxx ".$vj." bbb ".$vk." aaa");
			$resedges = $this->createCircle($vi,$vj,$vk,$x,$y,$z,$key,$vkey);
         	$edges = array_merge($edges,$resedges[1]);
         	//$compete = $resedges[2];
			 //echo("<br>edges at end of v loop vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv ");
			 //print_r($edges);
			 //print_r($c);
			 //print_r($this->v);
			 //print_r($this->complete);
         } // end of the vertices loop
         // array_values returns all the values of the array, ignoring the keys
         $edges=array_values($edges);
			//echo("<br>edges after end of v loop ");
			 //print_r($edges);

         /*
            Tag multiple edges
            Note: if all triangles are specified anticlockwise then all
            interior edges are opposite pointing in direction.
         */
  		// run a nested loop of edges within edges
         // $ekey is the key, $earr is the value for each item in array $edges
         // if there are two identical edges in the array of edges, remove them both?
         $edges = $this->removeDuplicateEdges($edges);

         /*
            Form new triangles for the current point
            Skipping over any tagged edges.
            All edges are arranged in clockwise order.
         */
         $this->complete=array_values($this->complete);
         $this->v=array_values($this->v);
         $ntri=count($this->v);
         $edges=array_values($edges);
         //echo("<br><BR><BR> v PRE DOES THIS WORK ....");
          //print_r($this->v);

         $this->createNewEdges($edges,$x,$y,$key,$ntri);

         //$this->v = array_merge($this->v, $result[0]);
         //$complete = array_merge($complete,$result[1]);
         //echo("<br><BR><BR> v DOES THIS WORK ....");
          //print_r($this->v);
          //echo("<br><BR><BR> complete ....");
         //print_r($this->complete);
         //echo("<br><BR><BR><BR> end of x loop xxxxxxxxxxxxxxxxxxxxxxx");
     } // end of for each x

      /*
         Remove triangles with supertriangle vertices
         These are triangles which have a vertex number greater than nv
      */
         //echo("<br><BR><BR><BR> totals ----------------------------");
      //print_r($this->v);
         //echo("<br><BR><BR><BR> totals ----------------------------");
      foreach ($this->v as $key => $arr)
      {
         if ($this->v[$key][0] >= $n || $this->v[$key][1] >= $n || $this->v[$key][2] >= $n)
         {
            unset($this->v[$key]);
         }
      }
      $this->v=array_values($this->v);


      foreach ($this->v as $key => $arr)
      {
         $this->indices[]=$arr;
         $this->delaunay[]=array(array($x[$arr[0]],$y[$arr[0]],$x[$arr[1]],$y[$arr[1]]),
                                 array($x[$arr[1]],$y[$arr[1]],$x[$arr[2]],$y[$arr[2]]),
                                 array($x[$arr[2]],$y[$arr[2]],$x[$arr[0]],$y[$arr[0]])
                                 );
      }
      return $this->v;
   }
function createNewEdges($edges,$x,$y,$key,$ntri) {
//echo("<br> edges in create new edges");
//print_r($edges);
         foreach ($edges as $ekey => $earr)
         {
            list($vi,$vj,$vk)=array($edges[$ekey][0],$edges[$ekey][1],$key);
            //echo("<br><BR><BR>XXXXXX");
            //echo($vi." ".$vj." ".$vk." ");
            //print_r($x);
            //print_r($y);
            //echo("<br>XXXXXX<br><BR>");

            if ($this->side($x[$vi],$y[$vi],$x[$vj],$y[$vj],$x[$vk],$y[$vk])==0)
            {
               array_push($this->v,array($vi,$vj,$vk));

            } elseif($this->side($x[$vk],$y[$vj],$x[$vj],$y[$vi],$x[$vi],$y[$vk])==0)
            {
               array_push($this->v,array($vk,$vj,$vi));

            } elseif($this->side($x[$vk],$y[$vi],$x[$vi],$y[$vj],$x[$vj],$y[$vk])==0)
            {
               array_push($this->v,array($vk,$vi,$vj));

            } elseif($this->side($x[$vj],$y[$vi],$x[$vi],$y[$vk],$x[$vk],$y[$vj])==0)
            {
               array_push($this->v, array($vj,$vi,$vk));

            } elseif($this->side($x[$vj],$y[$vk],$x[$vk],$y[$vi],$x[$vi],$y[$vj])==0)
            {
               array_push($this->v, array($vj,$vk,$vi));

            } elseif($this->side($x[$vi],$y[$vk],$x[$vk],$y[$vj],$x[$vj],$y[$vi])==0)
            {
               array_push($this->v, array($vi,$vk,$vj));

            }  elseif($this->side($x[$vk],$y[$vk],$x[$vj],$y[$vj],$x[$vj],$y[$vi])==0)
            {
               array_push($this->v, array($vk,$vj,$vi));

            }  elseif($this->side($x[$vj],$y[$vj],$x[$vk],$y[$vk],$x[$vi],$y[$vi])==0)
            {
               array_push($this->v, array($vj,$vk,$vi));
            }
            else
            {
               array_push($this->v,array($vi,$vj,$vk));
            }
            $this->complete[$ntri++]=0;
         }
         //return array($v,$complete);
}
function createCircle($vi,$vj,$vk,$x,$y,$z,$key,$vkey) {
            // create the circum circle for the three points

            // check for colinearity
		$edges = array();
		$c = array();

		if ((($x[$vi] == $x[$vj]) && ($x[$vi] == $x[$vk])) or (($y[$vi] == $y[$vj]) && ($y[$vj] == $y[$vk]))) {
			echo("7777777777777n colinear");
			return array($c,$edges);
		}
		else {
            $c=$this->CircumCircle($x[$vi],$y[$vi],$x[$vj],$y[$vj],$x[$vk],$y[$vk]);
            //echo("complete ".$c->x." ".$c->r." ".$x[$key]);


		// crude filter to check if the point is inside the circle
		// if the centre of hte circle plus the radius are smaller than the x value then
		// the point is outside the circle
		// mark complete for this vertex as 1
	    if ($c->x + $c->r < $x[$key]) {
	    //echo("complete ".$vkey." 1");
	    $this->complete[$vkey]=1;}
	    else {
	    //echo("not complete $vkey");
	    }

		// if the circle is not a tiny circle, and the current point is inside this circle
		//echo("<br>inside");
		//print_r($c);
		//echo($x[$key]." ".$y[$key]);
		//echo("inside is ".$this->inside($c, $x[$key],$y[$key])."<br>");
		//print_r($x);
		//print_r($y);
		//echo($vi." ".$vj." ".$vk);
		//echo("<br> aaaa");
		// if the circle is of a significant size and the point in question is inside the circle
		// then check which side of the directed vector the new point is
        if ($c->r > EPSILON && $this->inside($c, $x[$key],$y[$key]))
            {
            // the side function checks whether the point is to the left or right of the directed vector
            // 0 means it is on the left side
               if ($this->side($x[$vi],$y[$vi],$x[$vj],$y[$vj],$x[$vk],$y[$vk])==0)
               {
                  $edges[]=array($vi,$vj);
                  $edges[]=array($vj,$vk);
                  $edges[]=array($vk,$vi);

               } elseif($this->side($x[$vk],$y[$vj],$x[$vj],$y[$vi],$x[$vi],$y[$vk])==0)
               {
                  $edges[]=array($vk,$vj);
                  $edges[]=array($vj,$vi);
                  $edges[]=array($vi,$vk);

               } elseif($this->side($x[$vk],$y[$vi],$x[$vi],$y[$vj],$x[$vj],$y[$vk])==0)
               {
                  $edges[]=array($vk,$vi);
                  $edges[]=array($vi,$vj);
                  $edges[]=array($vj,$vk);

               } elseif($this->side($x[$vj],$y[$vi],$x[$vi],$y[$vk],$x[$vk],$y[$vj])==0)
               {
                  $edges[]=array($vj,$vi);
                  $edges[]=array($vi,$vk);
                  $edges[]=array($vk,$vj);

               } elseif($this->side($x[$vj],$y[$vk],$x[$vk],$y[$vi],$x[$vi],$y[$vj])==0)
               {
                  $edges[]=array($vj,$vk);
                  $edges[]=array($vk,$vi);
                  $edges[]=array($vi,$vj);

               } elseif($this->side($x[$vi],$y[$vk],$x[$vk],$y[$vj],$x[$vj],$y[$vi])==0)
               {
                  $edges[]=array($vi,$vk);
                  $edges[]=array($vk,$vj);
                  $edges[]=array($vj,$vi);

               } elseif($this->side($x[$vk],$y[$vk],$x[$vi],$y[$vi],$x[$vj],$y[$vj])==0)
               {
                  $edges[]=array($vk,$vi);
                  $edges[]=array($vi,$vj);
                  $edges[]=array($vj,$vk);

               } elseif($this->side($x[$vj],$y[$vj],$x[$vk],$y[$vk],$x[$vi],$y[$vi])==0)
               {
                  $edges[]=array($vj,$vk);
                  $edges[]=array($vk,$vi);
                  $edges[]=array($vi,$vj);
               }
               else
               {
               		//echo("<br>QQQQQQQQ no side!");
                  $edges[]=array($vi,$vj);
                  $edges[]=array($vj,$vk);
                  $edges[]=array($vk,$vi);
               }
				// unset destroys the specified variables
               unset($this->v[$vkey]);
               unset($this->complete[$vkey]);
            } else {
            	//echo("<br>epsilon problem <br>");
            }
	return array($c,$edges);
	}
}

   function main($pointset=0,$stageWidth=400,$stageHeight=400)
   {
      $this->stageWidth = $stageWidth;
      $this->stageHeight = $stageHeight;
      $this->delaunay = array();
      $this->pointset = array();
      $this->indices = array();
      $this->v = array();
      $this->complete = array();

      if ($pointset==0)
      {
      	// random generator
         for ($i=0; $i<15; $i++)
         {
            list($x,$y,$z)=array((float)rand(1,$this->stageWidth),(float)rand(1,$this->stageHeight));
            $this->pointset[]=array($x,$y,$z);
         }
      } else
      {
         $this->pointset=$pointset;
      }

      $x = $y = $z = $sortX = array();
      foreach($this->pointset as $key => $arr)
      {
         $sortX[$key] = $arr[0];
      }
      //echo("<br><Br>");
      //echo("pointset");
      //print_r($this->pointset);
      //echo("<br><Br>");
      array_multisort($sortX, SORT_ASC, SORT_NUMERIC, $this->pointset);

      foreach ($this->pointset as $key => $arr)
      {
        list($x[],$y[],$z[]) = $arr;
      }
      $result=$this->getEdges(count($this->pointset), $x, $z);
      return $result;
   }

function removeDuplicateEdges($edges) {
		foreach ($edges as $ekey => $earr)
         {
         // $ikey is the key, $iarr is the value for each item in array $edges
            foreach ($edges as $ikey => $iarr)
            {
               if ($ekey != $ikey)
               {
                  if (($earr[0] == $iarr[1]) && ($earr[1] == $iarr[0]))
                  {
                     unset($edges[$ekey]);
                     unset($edges[$ikey]);

                  } elseif (($earr[0] == $iarr[0]) && ($earr[1] == $iarr[1]))
                  {
                     unset($edges[$ekey]);
                     unset($edges[$ikey]);
                  }
               }
            }
         }
	return $edges;
}

}
?>