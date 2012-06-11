function test(svg, g)
{
	drawAssemblyGraph(svg, g, "123123");
}

function curve(sx, sy, ex, ey, cx1, cy1, cx2, cy2)
{
	var dValue = "M"+sx+","+sy+" C"+cx1+","+cy1+ " " + cx2+","+cy2+" "+ex+","+ey;
	return dValue;
}

function cornerBendOutwardEastEndpoint(svg, g, sx, sy, ex, ey)
{
	var c = curve(sx, sy, ex, ey, (sx + ex)/2, sy, ex, (sy + ey)/2);
	svg.path(g, c, {fill: 'none', stroke: 'black', 'stroke-width': 2});	
}

function cornerBendTowardEastEndpoint(svg, g, sx, sy, ex, ey)
{
	var c = curve(sx, sy, ex, ey, sx, (sy + ey)/2, (sx + ex)/2, ey);
	svg.path(g, c, {fill: 'none', stroke: 'black', 'stroke-width': 2});
}

function drawArcNorth(svg, g, sx, sy, ex, ey, h)
{
	bc1_sx = sx;
	bc1_sy = sy;
	bc1_ex = (sx + ex)/2;
	bc1_ey = sy - h;
	bc1_cx1 = bc1_sx;
	bc1_cy1 = (bc1_sy + bc1_ey)/2;
	bc1_cx2 = bc1_sx;
	bc1_cy2 = bc1_ey;
  	part1 = curve(bc1_sx, bc1_sy, bc1_ex, bc1_ey, bc1_cx1, bc1_cy1, bc1_cx2, bc1_cy2);
  	
	bc2_sx = bc1_ex;
	bc2_sy = bc1_ey;
	bc2_ex = ex;
	bc2_ey = ey;
	bc2_cx1 = bc2_ex;
	bc2_cy1 = bc2_sy;
	bc2_cx2 = bc2_ex;
	bc2_cy2 = bc1_cy1;
  	part2 = curve(bc2_sx, bc2_sy, bc2_ex, bc2_ey, bc2_cx1, bc2_cy1, bc2_cx2, bc2_cy2);
  	
  	svg.path(g, part1, {fill: 'none', stroke: 'black', 'stroke-width': 2});
  	svg.path(g, part2, {fill: 'none', stroke: 'black', 'stroke-width': 2});
}

function drawArcSouth(svg, g, sx, sy, ex, ey, h)
{
	drawArcNorth(svg, g, sx, sy, ex, ey, -h);
}

function drawLine(svg, g, sx, sy, ex, ey)
{
	svg.line(g, sx, sy, ex, ey, {fill: 'none', stroke: 'black', 'stroke-width': 2});
}

function drawNode(svg, g, cx, cy, text, radius)
{
	svg.circle(g, cx, cy, radius, {fill: 'red', stroke: 'black', 'stroke-width': 2});
	svg.text(g, cx, cy, String(text), {'font-family': 'courier', 'font-size': 24, stroke: 'none', fill: 'black', 'text-anchor': 'middle', 'dominant-baseline': 'central'});
}

function belongs(element, array)
{
	return (array.indexOf(element) != -1);
}

function computeNextSubwordSize(assemblyWord, pos)
{
	var symbol = assemblyWord[pos];
	var symbolsSoFar = new Array();
	symbolsSoFar.push(symbol);
	var count = 1;
	for(var i = pos + 1; i < assemblyWord.length; i++)
	{
		symbol = assemblyWord[i];
		if( belongs(symbol, symbolsSoFar) )
		{
			count--;
			if( count === 0 ) return (i - pos + 1)/2;
		}
		else
		{
			count++;
			symbolsSoFar.push(symbol);
		}
	}
	
	return 0;
}

function drawAssemblyGraph(svg, g, assemblyWord)
{
	assemblyWord.push('t');
	assemblyWord.unshift('b');
	currentX = 10;
	currentY = 175;
	nodeRadius = 16;
	step = 200;
	graphSize = step*(assemblyWord.length/2 - 2) + 2*nodeRadius;
	start = -130;//(board.width.baseVal.value - graphSize)/2 - step;
	if( graphSize <= 950 )
	{
		start = (950 - graphSize)/2 - step;
	}
	currentX = start;
	
	subwordSize = computeNextSubwordSize(assemblyWord, 1);
	nextSubwordIndex = subwordSize*2;
	heightNorth = heightSouth = (subwordSize + 1)*30;//100;
	heightDecrement = 30;
	nodesConstructed = []
	currentPort = 'b';
	
	for(i = 1; i < assemblyWord.length; i++)
	{  	
		if( i === nextSubwordIndex + 2)
		{
			subwordSize = computeNextSubwordSize(assemblyWord, i - 1);
			heightNorth = heightSouth = (subwordSize + 1)*30;
			nextSubwordIndex = nextSubwordIndex + subwordSize*2;
		}		

		nodeName = assemblyWord[i];
		prevNodeName = assemblyWord[i - 1];
  			
		if( belongs(nodeName, nodesConstructed) )
		{	
  				
			if( currentPort == 'e' ) //just came out of a new node
			{
				cornerBendOutwardEastEndpoint(svg, g, currentX + nodeRadius, currentY, currentX + nodeRadius + step/15, currentY - nodeRadius);
				drawArcNorth(svg, g, currentX + nodeRadius + step/15, currentY - nodeRadius, start + step*(parseInt(nodeName)), currentY - nodeRadius, heightNorth);
				heightNorth = heightNorth - heightDecrement;
				currentPort = 's';
			}
			else if( currentPort == 's') //came out from a node already seen
			{
				drawArcSouth(svg, g, start + step*(parseInt(prevNodeName)), currentY + nodeRadius, start + step*(parseInt(nodeName)), currentY + nodeRadius, heightSouth);
				heightSouth = heightSouth - heightDecrement;
				currentPort = 'n';	
			}
			else if( currentPort == 'n' ) //came out from a node already seen
			{
				drawArcNorth(svg, g, start + step*(parseInt(prevNodeName)), currentY - nodeRadius, start + step*(parseInt(nodeName)), currentY - nodeRadius, heightNorth);
				heightNorth = heightNorth - heightDecrement;
				currentPort = 's';
			}
  				
	}
	else //new node
	{
		if( nodeName == 't' )
		{
			if( currentPort == 's' )
			{
				drawLine(svg, g, start + step*parseInt(prevNodeName), currentY + nodeRadius, start + step*parseInt(prevNodeName), currentY + nodeRadius + step/6);
			} else if( currentPort == 'n' )
				   {
						drawLine(svg, g, start + step*parseInt(prevNodeName), currentY - nodeRadius, start + step*parseInt(prevNodeName), currentY - nodeRadius - step/6);
  					}
		}
		else 
		{
			nodesConstructed.push(nodeName);
  					
			currentX = currentX + step; //x coordinate of a new node 			
			drawNode(svg, g, currentX, currentY, nodeName, nodeRadius); //draw new node
			if( currentPort == 'e' ) //just came out of a new node
			{
				drawLine(svg, g, currentX + nodeRadius - step, currentY, currentX - nodeRadius, currentY); 
				currentPort = 'e';
			} else if( currentPort == 'b' )
			{
				drawLine(svg, g, currentX - nodeRadius - step/5, currentY, currentX - nodeRadius, currentY);
				currentPort = 'e';
			} else if( currentPort == 's' )
			{
				drawArcSouth(svg, g, start + step*parseInt(prevNodeName), currentY + nodeRadius, currentX - nodeRadius - step/15, currentY + nodeRadius, heightSouth);
				heightSouth = heightSouth - heightDecrement;
				cornerBendTowardEastEndpoint(svg, g, currentX - nodeRadius - step/15, currentY + nodeRadius, currentX - nodeRadius, currentY);
				currentPort = 'e';
			} else if( currentPort == 'n' )
			{
				drawArcNorth(svg, g, start + step*parseInt(prevNodeName), currentY - nodeRadius, currentX - nodeRadius - step/15, currentY - nodeRadius, heightNorth);
				heightNorth = heightNorth - heightDecrement;
				cornerBendTowardEastEndpoint(svg, g, currentX - nodeRadius - step/15, currentY - nodeRadius, currentX - nodeRadius, currentY);
				currentPort = 'e';  						
			}
		}
  				
  				
  	}
  			
  }
  		
}