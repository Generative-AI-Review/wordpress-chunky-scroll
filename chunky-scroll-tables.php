<?php
/*
Plugin Name: Chunky Scroll Tables
Description: Adds top & bottom faux horizontal scrollbars to tables tagged with the 'chunky-scroll' CSS class.
Version:     1.0
Author:      Terry
*/

add_action( 'wp_enqueue_scripts', 'cst_enqueue_assets' );
function cst_enqueue_assets() {
	$uri = plugin_dir_url( __FILE__ );
	wp_enqueue_style ( 'chunky-table-scroll', $uri . 'chunky-table-scroll.css', [], '1.0' );
	wp_enqueue_script( 'chunky-table-scroll', $uri . 'chunky-table-scroll.js', [], '1.0', true );
}

/* Uncomment to see the scrollbars while editing in Gutenberg
add_action( 'enqueue_block_editor_assets', 'cst_enqueue_assets' );
*/
