/**
 * This is base arc.
 *
 *
 */

function BaseEdge(vertex1, vertex2, isDirect, weight)
{
    this.vertex1    = vertex1;
    this.vertex2    = vertex2;
    this.arrayStyleStart  = "";
    this.arrayStyleFinish = "";
    
    this.isDirect  = isDirect;
    this.weight    = 0;
    this.text      = "";
    // For direct graph, has pair edge or not.
    this.hasPair   = false;
    this.useWeight = false;
    this.id        = 0;
    this.model = new EdgeModel();
    
    if (weight !== undefined)
      this.SetWeight(weight);
}

BaseEdge.prototype.SaveToXML = function ()
{
	return "<edge " + 
	       "vertex1=\""     + this.vertex1.id   + "\" " +
	       "vertex2=\""     + this.vertex2.id   + "\" " +
	       "isDirect=\""   + this.isDirect + "\" " +
	       "weight=\""     + this.weight   + "\" " +
	       "useWeight=\""  + this.useWeight + "\" " +
	       "hasPair=\""    + this.hasPair + "\" " +
	       "id=\""         + this.id + "\" " +
           "text=\""       + this.text + "\" " +
           "arrayStyleStart=\""       + this.arrayStyleStart + "\" " +
           "arrayStyleFinish=\""       + this.arrayStyleFinish + "\" " +
           this.model.SaveToXML() + 
		"></edge>";       
}

BaseEdge.prototype.LoadFromXML = function (xml, graph)
{
    var attr       =    xml.attr('vertex1');
	this.vertex1   =    graph.FindVertex(parseInt(typeof attr !== 'undefined' ? attr : xml.attr('graph1')));
    var attr       =    xml.attr('vertex2');
	this.vertex2   =    graph.FindVertex(parseInt(typeof attr !== 'undefined' ? attr : xml.attr('graph2')));
	this.isDirect  =    xml.attr('isDirect') == "true";
	this.weight    =    parseFloat(xml.attr('weight'));
	this.hasPair   =    xml.attr('hasPair') == "true";
	this.useWeight =    xml.attr('useWeight') == "true";
    this.id        =    parseInt(xml.attr('id'));
    this.text      =    xml.attr("text") == null ? "" : xml.attr("text");
    this.arrayStyleStart      =   xml.attr("arrayStyleStart") == null ? "" : xml.attr("arrayStyleStart");
    this.arrayStyleFinish      =  xml.attr("arrayStyleFinish") == null ? "" : xml.attr("arrayStyleFinish");
    
    this.model.LoadFromXML(xml);
}

BaseEdge.prototype.GetPixelLength = function ()
{
    if (this.vertex1 == this.vertex2)
    {
        return (new CommonEdgeStyle()).sizeOfLoop * 2 * Math.PI;
    }
    else
    {
        return Point.distance(this.vertex1.position, this.vertex2.position);
    }
}

BaseEdge.prototype.GetWeight = function ()
{
    return this.useWeight ? this.weight : 1;
}

BaseEdge.prototype.GetText = function ()
{
    return this.text.length > 0 ? this.text : (this.useWeight ? this.weight.toString() : "");
}

BaseEdge.prototype.GetStartEdgeStyle = function ()
{
    return this.arrayStyleStart;
}

BaseEdge.prototype.GetFinishEdgeStyle = function ()
{
    return (this.arrayStyleFinish != "" ? this.arrayStyleFinish : (this.isDirect ? "arrow" : ""));
}

BaseEdge.prototype.HitTest = function (pos)
{
    var positions = this.GetEdgePositionsShift();
    return this.model.HitTest(positions[0], positions[1], pos);
}

BaseEdge.prototype.GetEdgePositionsShift = function()
{
    var pairShift = this.vertex1.model.diameter * 0.25;
    var shift     = (this.hasPair ? pairShift : 0);
    
    if (shift == 0 || this.model.type == EdgeModels.cruvled)
    {
        return this.GetEdgePositions();
    }
    else
    {
        var position1 = this.vertex1.position;
        var position2 = this.vertex2.position;
        var diameter1 = this.vertex1.model.diameter;
        var diameter2 = this.vertex2.model.diameter;
        
        var direction = position1.subtract(position2);
        direction.normalize(1.0);
        var normal = direction.normal();
        direction = direction.multiply(0.5);
        position1 = position1.subtract(normal.multiply(shift));
        position2 = position2.subtract(normal.multiply(shift));
        diameter1 = Math.sqrt(diameter1 * diameter1 - shift * shift);
        diameter2 = Math.sqrt(diameter2 * diameter2 - shift * shift);
        var res = [];
        res.push(position1.subtract(direction.multiply(diameter1)));
        res.push(position2.subtract(direction.multiply(-diameter2)));
        return res;
    }  
}

BaseEdge.prototype.GetEdgePositions = function()
{
    var position1 = this.vertex1.position;
    var position2 = this.vertex2.position;
    var diameter1 = this.vertex1.model.diameter;
    var diameter2 = this.vertex2.model.diameter;

    var direction = position1.subtract(position2);
    
    var direction1 = direction;
    var direction2 = direction;
    var d1        = diameter1;
    var d2        = -diameter2;
    
    if (this.model.type == EdgeModels.cruvled)
    {
        var dist   = position1.distance(position2);
        var point1  = this.model.GetCurvedPoint(position1, position2, 10.0 / dist);
        direction1  = position1.subtract(point1);
        
        var point2  = this.model.GetCurvedPoint(position1, position2, 1.0 - 10.0 / dist);
        direction2  = position2.subtract(point2);
        
        d2         = diameter2;
    }

    direction1.normalize(1.0);
    direction1 = direction1.multiply(0.5);
    direction2.normalize(1.0);
    direction2 = direction2.multiply(0.5);

    var res = [];
    res.push(position1.subtract(direction1.multiply(d1)));
    res.push(position2.subtract(direction2.multiply(d2)));
    return res;
}

BaseEdge.prototype.SetWeight = function(weight)
{
	var useWeight = false;
	if (!isNaN(parseInt(weight, 10)))
	{
		useWeight = true;
	}
	weight = (!isNaN(parseInt(weight, 10)) && weight >= 0) ? weight : 1;
    
    this.weight    = Number(weight);
    this.useWeight = useWeight;
}