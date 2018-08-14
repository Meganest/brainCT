
  window.URL = window.URL ? window.URL :
               window.webkitURL ? window.webkitURL : window;

  function Tree(selector) {
    this.$el = $(selector);
    this.fileList = [];
    var html_ = [];
    var tree_ = {};
    var pathList_ = [];
    var self = this;

    this.render = function(object) {
      if (object) {
        for (var folder in object) {
          if (!object[folder]) { // file's will have a null value
            html_.push('<li><a href="#" data-type="file">', folder, '</a></li>');
          } else {
            html_.push('<li><a href="#">', folder, '</a>');
            html_.push('<ul>');
            self.render(object[folder]);
            html_.push('</ul>');
          }
        }
      }
    };

    this.buildFromPathList = function(paths) {
      for (var i = 0, path; path = paths[i]; ++i) {
        var pathParts = path.split('/');
        var subObj = tree_;
        for (var j = 0, folderName; folderName = pathParts[j]; ++j) {
          if (!subObj[folderName]) {
            subObj[folderName] = j < pathParts.length - 1 ? {} : null;
          }
          subObj = subObj[folderName];
        }
      }
      return tree_;
    }

    this.init = function(e) {

      $('#info').hide();

      html_ = [];
      tree_ = {};
      pathList_ = [];
      self.fileList = e.target.files;

      for (var i = 0, file; file = self.fileList[i]; ++i) {
        pathList_.push(file.webkitRelativePath);
      }

      self.render(self.buildFromPathList(pathList_));

      self.$el.html(html_.join('')).tree({
        expanded: 'li:first'
      });

      var fileNodes = self.$el.get(0).querySelectorAll("[data-type='file']");
      for (var i = 0, fileNode; fileNode = fileNodes[i]; ++i) {
        fileNode.dataset['index'] = i;
      }

      $('#loadAll').show();

    }
  };


  	var tree = new Tree('#dir-tree');

  	var interval;

  	var count=0,lcount=0, clone;

  	$("#side").height(window.innerHeight-20);

  	$('#file_input').change(tree.init);


	tree.$el.click(function(e){
	    if (e.target.nodeName == 'A' && e.target.dataset['type'] == 'file') {
	      var file = tree.fileList[e.target.dataset['index']];
	      load(file);
	      $("#results,#sidebar").show();
	    }
	});

  	//Infinity setup
	var $el = $('#infinity');

	var listView = new infinity.ListView($el, {
	    lazy: function() {
		    var x = $(this).attr("data-infinity-pageid");
		    console.log(x);
		    if(x>1){
		    	i++;
		        if(tree.fileList.length>i){
		            load(tree.fileList.item(i),true);
		        }
		    }
	 	}
	});


	$('#sidebar').click(function(){
		$("#side").animate({width:'toggle'},200);
	    stop();
	});

	$('#loadAll').click(function(){
	    for (i = 0; i<9 ; i++) {
	        if(tree.fileList.length>i){
	          load(tree.fileList.item(i),true);
	        }
	    }
	    i--;
	    $("#results,#sidebar,#play").show();
	    $("#single div").remove();
	});


	$(window).resize(function() {
	  $("#side").height(window.innerHeight-20);
	});

        var scrollpos = 0;
/////////////////////////////////////////////////////////////////////////////////////////////////////////
	$('#results').on("click", "#tools_sketch", function(){
		scrollpos = document.body.scrollTop;
                clone = $(this).clone();
		// clone.height(window.innerHeight);
		var url = $( this ).css('background-image');
		url = url.replace(/(url\(|\)|")/g, '');
		$("#comparediv").attr('class',url);
		$("#modalimg").html(clone);
		$("#modal").show();
		$("#container").hide();
		$('#tools_sketch').sketch();
		// clone.dblclick(function(){
		// 	$(this).toggleClass("all");
		// });

	});
	$('#infinity').on("click", "#tools_sketch", function(){
		var page = Number($(this).parent().attr("data-slide"))+1;
		var pagename = $(".tree ul li:nth-child("+page+")").children().html();
		var parent = $(".tree-parent").html();
		$("#download").attr('class',parent+"."+pagename);
		$("#compare").attr('class',pagename);
	});

	$('#dir-tree').on("click","a", function(){
		var file_name = $( this ).html();
		var parent = $(this).parent().parent().parent().children(":first").html();
		$("#download").attr('class',parent+"."+file_name);
		$("#compare").attr('class',file_name);
	});

	$('#fileinput')[0].onclick = function () {
 	   	this.value = null;
	};
	
	$('#fileinput').change(function(evt){
		var file_name = $("#compare").attr('class');
		var files = evt.target.files; 
		var url = $('#comparediv').attr('class');
		var cv = $('#comparediv')[0];
	    var context = cv.getContext('2d');
		$('#comparediv').css('background-image', 'url(' + url + ')');
		context.clearRect(0, 0, 512, 512);
	    if (files) {
	    	var ct = 0;
	        for (var i=0, f; f=files[i]; i++) {
	              var r = new FileReader();
	            r.onload = (function(f) {
	                return function(e) {
	                    var contents = e.target.result;	                    
	                    if (f.name != file_name){
	                    	if (f.name.includes(file_name)) {	                 
		                    	var img = new Image;
							    img.src = contents;
							    img.onload = function() {
							        context.drawImage(img, 0,0);
							    }
							    ct++;
							    sentfeedback(ct+" results",10000);
						    }	  
						}
	                };
	            })(f);
	            r.readAsDataURL(f);
	        }	           
	    } else {
	          sentfeedback("Failed to load files",10000); 
	    }
	    
	});

	$('#login').on('click', function(e){
		if ($("#docname").html()=="") {
			$("#error").html("Please Enter The Doctor Name.");
		}
		else if ($("#docname").html().length < 4) {
			$("#error").html("Please Enter More Than 4 Characters.");
		}
		else{
	        e.preventDefault();
	        $('#file_input')[0].click();
	    }
    });
	$('#compare').on('click', function(e){
        e.preventDefault();
        $('#fileinput')[0].click();
    });
	// $('#compare').on('click', function(e){
 	//  var file_name = $(this).attr('class');
	// 	var $i = $( '#file_input' ), // Put file input ID here
	// 		input = $i[0];
	// 	var url = $('#comparediv').attr('class');
	// 	var cv = $('#comparediv')[0];
	//     var context = cv.getContext('2d');
	// 	$('#comparediv').css('background-image', 'url(' + url + ')');
	// 	context.clearRect(0, 0, 512, 512);
	// 	files = input.files;	
	//     if (files) {	   	    	
	//         for (var i=0, f; f=files[i]; i++) {
	//               var r = new FileReader();	              
	//             r.onload = (function(f) {
	//                 return function(e) {
	//                     var contents = e.target.result;	                    
	//                     if (f.name != file_name){
	//                     	if (f.name.includes(file_name)) {	                 
	// 	                    	var img = new Image;
	// 						    img.src = contents;
	// 						    img.onload = function() {
	// 						        context.drawImage(img, 20,20);
	// 						    }
	// 					    }	  
	// 					}
	//                 };
	//             })(f);
	//             r.readAsDataURL(f);
	//         }   
	//     } else {
	//           alert("Failed to load files"); 
	//     }
 	//    });


	function downloadCanvas(link, canvasId, filename) {
    link.href = document.getElementById(canvasId).toDataURL();
    link.download = filename;
	}
	function sentfeedback(fb,time){
		$("#feedback").html(fb);
	    setTimeout(function(){
	    	$("#feedback").html("");
	    }, time);
	};

	document.getElementById('download').addEventListener('click', function() {
		var file_name = $("#docname").html()+'.'+$(this).attr('class');
	    downloadCanvas(this, 'tools_sketch', file_name);
	    sentfeedback("save completed!",3000);
	}, false);
/*
	$('#modalzoom').click(function(){
		clone.wheelzoom();
	});
*/	
	$(function() {
	    $.each(['#f00', '#ff0', '#0f0', '#0ff', '#00f', '#f0f', '#000', '#fff'], function() {
	      $('.tools').append("<a href='#tools_sketch' data-color='" + this + "' style='width: 5px; color:"+this+"; background: " + this + ";'>co</a> ");
	    });
	    $('.tools').append("<a style='margin-right: 10px;'></a>");
	    $('.tools').append("<a style='font-size: 15px; text-decoration: none;'>Font Size : </a>");
	    $.each([2, 3, 4, 5], function() {
	      $('.tools').append("<a href='#tools_sketch' data-size='" + this + "' style='text-decoration: none; font-size: 20px; '>" + this + "</a> ");
	    });
	    // $( '#results' ).on( 'click', '#colors_sketch', function () { $('#colors_sketch').sketch(); });
  	});

 //////////////////////////////////////////////////////////////////////////////////////////////////////

	$('#modalclose').click(function(){
		$("#modal").hide();
		context.clearRect(0, 0, 512, 512);
		$("#comparediv").css('background-image', 'none');
		$("#container").show();
		clone.remove();
                document.body.scrollTop = scrollpos;
	});

	// $('#results').on("dblclick", "img", function(){
	// 	stop();
	// 	$("#side").animate({width:'toggle'},200);
	// 	$("#results").toggleClass("all");
	// });


	// $('#results').on("click", "#tools_sketch", function(){
	// 	stop();
	// 	$("#results").toggleClass("click");

	// 	if( $("#results").hasClass("click") ){
	// 		$("#results img").height(window.innerHeight);
	// 	} else {
	// 		$("#results img").height("auto");
	// 	}
	// });

	//Slideshow with Infinity
	$('#play').click(function(){
		var txt = $(this).text();
		$("#results img").height(window.innerHeight);
		if(txt="Play"){
			$(this).text("Stop");
	    	$("#side").animate({width:'hide'},200);
	    	interval = window.setInterval(slide, 3000);		
		} else {
			stop();
			$("#results img").height("auto");
		}
  	});

	function stop(){
		clearInterval(interval);
		$('#play').text("Play");
		count=0;
	}

	function slide(){
		count++;

		var nextslide = $(".image[data-slide="+count+"]");
		$('html, body').animate({
		    scrollTop: nextslide.offset().top
		}, 200);

	    if(count==lcount-1){
	    	$('#sidebar').trigger("click");
			$('html, body').animate({
			    scrollTop: 0
			}, 200);
	    } 
		
	}
	function load(file,infinity){
	  var reader = new FileReader();
	  //check for image
      if (file.type.match(/image.*/)) {
		  reader.onload = function(e) {
		  	if(infinity){
		  		var $newContent = $('<div class="image" data-slide="'+lcount+'"><canvas id="tools_sketch" width="512px" height="512px" style="background : url('+reader.result+')"></canvas></div>');
		  		listView.append($newContent);
		  		lcount++;		
		  	} else {
			    $("#single").html('<div class="image" data-slide="'+lcount+'"><canvas id="tools_sketch" width="512px" height="512px" style="background : url('+reader.result+')"></canvas></div>');
		  	}
		  }
		  reader.readAsDataURL(file);
      } else {
      	console.log("not an image");
      }
	}
